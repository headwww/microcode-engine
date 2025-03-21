import {
	Asset,
	AssetBundle,
	AssetItem,
	AssetLevel,
	AssetLevels,
	AssetList,
	AssetType,
	IPublicTypeAssetsJson,
} from '@arvin-shu/microcode-types';
import { isCSSUrl } from './is-css-url';
import { evaluate, load } from './script';
import { createDefer } from './create-defer';

export function isAssetItem(obj: any): obj is AssetItem {
	return obj && obj.type;
}

export function isAssetBundle(obj: any): obj is AssetBundle {
	return obj && obj.type === AssetType.Bundle;
}

/**
 * 构建资源包
 * @param assets
 * @param level
 * @returns
 */
export function assetBundle(
	assets?: Asset | AssetList | null,
	level?: AssetLevel
): AssetBundle | null {
	if (!assets) {
		return null;
	}
	return {
		type: AssetType.Bundle,
		assets,
		level,
	};
}

/**
 * 构建资源项
 * @param type
 * @param content
 * @param level
 * @param id
 * @returns
 */
export function assetItem(
	type: AssetType,
	content?: string | null,
	level?: AssetLevel,
	id?: string
): AssetItem | null {
	if (!content) {
		return null;
	}
	return {
		type,
		content,
		level,
		id,
	};
}

function parseAssetList(
	scripts: any,
	styles: any,
	assets: AssetList,
	level?: AssetLevel
) {
	for (const asset of assets) {
		parseAsset(scripts, styles, asset, level);
	}
}

function parseAsset(
	scripts: any,
	styles: any,
	asset: Asset | undefined | null,
	level?: AssetLevel
) {
	if (!asset) {
		return;
	}
	if (Array.isArray(asset)) {
		return parseAssetList(scripts, styles, asset, level);
	}

	if (isAssetBundle(asset)) {
		if (asset.assets) {
			if (Array.isArray(asset.assets)) {
				parseAssetList(scripts, styles, asset.assets, asset.level || level);
			} else {
				parseAsset(scripts, styles, asset.assets, asset.level || level);
			}
			return;
		}
		return;
	}

	if (!isAssetItem(asset)) {
		asset = assetItem(
			isCSSUrl(asset) ? AssetType.CSSUrl : AssetType.JSUrl,
			asset,
			level
		)!;
	}
	let lv = asset.level || level;

	// 如果协议中没有明确level则资源全部设置为APP级别的
	if (!lv || AssetLevel[lv] == null) {
		lv = AssetLevel.App;
	}
	asset.level = lv;
	if (asset.type === AssetType.CSSUrl || asset.type === AssetType.CSSText) {
		styles[lv].push(asset);
	} else {
		scripts[lv].push(asset);
	}
}

export class StylePoint {
	private lastContent: string | undefined;

	private lastUrl: string | undefined;

	readonly level: number;

	readonly id: string;

	private placeholder: Element | Text;

	constructor(level: number, id?: string) {
		this.level = level;
		if (id) {
			this.id = id;
		}
		let placeholder: any;
		if (id) {
			placeholder = document.head.querySelector(`style[data-id="${id}"]`);
		}
		if (!placeholder) {
			placeholder = document.createTextNode('');
			const meta = document.head.querySelector(`meta[level="${level}"]`);
			if (meta) {
				document.head.insertBefore(placeholder, meta);
			} else {
				document.head.appendChild(placeholder);
			}
		}
		this.placeholder = placeholder;
	}

	applyText(content: string) {
		if (this.lastContent === content) {
			return;
		}
		this.lastContent = content;
		this.lastUrl = undefined;
		const element = document.createElement('style');
		element.setAttribute('type', 'text/css');
		if (this.id) {
			element.setAttribute('data-id', this.id);
		}
		element.appendChild(document.createTextNode(content));
		document.head.insertBefore(
			element,
			this.placeholder.parentNode === document.head
				? this.placeholder.nextSibling
				: null
		);
		document.head.removeChild(this.placeholder);
		this.placeholder = element;
	}

	applyUrl(url: string) {
		if (this.lastUrl === url) {
			return;
		}
		this.lastContent = undefined;
		this.lastUrl = url;
		const element = document.createElement('link');
		element.onload = onload;
		element.onerror = onload;

		const i = createDefer();
		function onload(e: any) {
			element.onload = null;
			element.onerror = null;
			if (e.type === 'load') {
				i.resolve();
			} else {
				i.reject();
			}
		}

		element.href = url;
		element.rel = 'stylesheet';
		if (this.id) {
			element.setAttribute('data-id', this.id);
		}
		document.head.insertBefore(
			element,
			this.placeholder.parentNode === document.head
				? this.placeholder.nextSibling
				: null
		);
		document.head.removeChild(this.placeholder);
		this.placeholder = element;
		return i.promise();
	}
}

export class AssetLoader {
	private stylePoints = new Map<string, StylePoint>();

	async load(assets: Asset) {
		const styles: any = {};
		const scripts: any = {};
		AssetLevels.forEach((level) => {
			styles[level] = [];
			scripts[level] = [];
		});
		parseAsset(scripts, styles, assets);
		const styleQueue: AssetItem[] = styles[AssetLevel.Environment].concat(
			styles[AssetLevel.Library],
			styles[AssetLevel.Theme],
			styles[AssetLevel.Runtime],
			styles[AssetLevel.App]
		);
		const scriptQueue: AssetItem[] = scripts[AssetLevel.Environment].concat(
			scripts[AssetLevel.Library],
			scripts[AssetLevel.Theme],
			scripts[AssetLevel.Runtime],
			scripts[AssetLevel.App]
		);

		await Promise.all(
			styleQueue.map(({ content, level, type, id }) =>
				this.loadStyle(content, level!, type === AssetType.CSSUrl, id)
			)
		);

		await Promise.all(
			scriptQueue.map(({ content, type, scriptType }) =>
				this.loadScript(content, type === AssetType.JSUrl, scriptType)
			)
		);
	}

	private loadStyle(
		content: string | undefined | null,
		level: AssetLevel,
		isUrl?: boolean,
		id?: string
	) {
		if (!content) {
			return;
		}
		let point: StylePoint | undefined;
		if (id) {
			point = this.stylePoints.get(id);
			if (!point) {
				point = new StylePoint(level, id);
				this.stylePoints.set(id, point);
			}
		} else {
			point = new StylePoint(level);
		}
		return isUrl ? point.applyUrl(content) : point.applyText(content);
	}

	private loadScript(
		content: string | undefined | null,
		isUrl?: boolean,
		scriptType?: string
	) {
		if (!content) {
			return;
		}
		return isUrl ? load(content, scriptType) : evaluate(content, scriptType);
	}

	async loadAsyncLibrary(asyncLibraryMap: Record<string, any>) {
		const promiseList: any[] = [];
		const libraryKeyList: any[] = [];
		const pkgs: any[] = [];
		for (const key in asyncLibraryMap) {
			// 需要异步加载
			if (asyncLibraryMap[key].async) {
				promiseList.push(window[asyncLibraryMap[key].library]);
				libraryKeyList.push(asyncLibraryMap[key].library);
				pkgs.push(asyncLibraryMap[key]);
			}
		}
		await Promise.all(promiseList).then((mods) => {
			if (mods.length > 0) {
				mods.map((item, index) => {
					const { exportMode, exportSourceLibrary, library } = pkgs[index];
					window[libraryKeyList[index]] =
						exportMode === 'functionCall' &&
						(exportSourceLibrary == null || exportSourceLibrary === library)
							? item()
							: item;
					return item;
				});
			}
		});
	}
}

export function mergeAssets(
	assets: IPublicTypeAssetsJson,
	incrementalAssets: IPublicTypeAssetsJson
): IPublicTypeAssetsJson {
	if (incrementalAssets.packages) {
		assets.packages = [
			...(assets.packages || []),
			...incrementalAssets.packages,
		];
	}

	if (incrementalAssets.components) {
		assets.components = [
			...(assets.components || []),
			...incrementalAssets.components,
		];
	}

	return assets;
}

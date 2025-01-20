import {
	AssetLevel,
	AssetList,
	AssetLevels,
	AssetType,
} from '@arvin-shu/microcode-types';
import {
	assetItem,
	isAssetBundle,
	isAssetItem,
	isCSSUrl,
} from '@arvin-shu/microcode-utils';
import { BuiltinSimulatorHost } from './host';

/**
 * 创建渲染模拟器
 * @param host 模拟器宿主对象
 * @param iframe iframe元素
 * @param vendors 资源列表
 * @returns 返回一个Promise,resolve时返回渲染器实例
 */
export function createSimulator(
	host: BuiltinSimulatorHost,
	iframe: HTMLIFrameElement,
	vendors: AssetList = []
) {
	const win: any = iframe.contentWindow;
	const doc = iframe.contentDocument!;
	// 获取内部插件
	const innerPlugins = host.designer.editor.get('innerPlugins');
	// 注入全局变量
	win.ArvinMicrocodeEngine = innerPlugins._getMicrocodePluginContext({});
	win.ArvinMicrocodeSimulatorHost = host;
	win._ = window._;
	// 初始化样式和脚本存储对象
	const styles: any = {};
	const scripts: any = {};
	AssetLevels.forEach((lv) => {
		styles[lv] = [];
		scripts[lv] = [];
	});

	/**
	 * 解析资产列表
	 * @param assets 资产列表
	 * @param level 资产级别
	 */
	function parseAssetList(assets: AssetList, level?: AssetLevel) {
		for (let asset of assets) {
			if (!asset) {
				continue;
			}
			// 处理资产包
			if (isAssetBundle(asset)) {
				if (asset.assets) {
					parseAssetList(
						Array.isArray(asset.assets) ? asset.assets : [asset.assets],
						asset.level || level
					);
				}
				continue;
			}
			// 处理数组类型资产
			if (Array.isArray(asset)) {
				parseAssetList(asset, level);
				continue;
			}
			// 处理URL类型资产
			if (!isAssetItem(asset)) {
				asset = assetItem(
					isCSSUrl(asset) ? AssetType.CSSUrl : AssetType.JSUrl,
					asset,
					level
				)!;
			}

			// 生成资产HTML标签
			const id = asset.id ? ` data-id="${asset.id}"` : '';
			const lv = asset.level || level || AssetLevel.Environment;
			const scriptType = asset.scriptType ? ` type="${asset.scriptType}"` : '';
			if (asset.type === AssetType.JSUrl) {
				scripts[lv].push(
					`<script src="${asset.content}"${id}${scriptType}></script>`
				);
			} else if (asset.type === AssetType.JSText) {
				scripts[lv].push(`<script${id}${scriptType}>${asset.content}</script>`);
			} else if (asset.type === AssetType.CSSUrl) {
				styles[lv].push(
					`<link rel="stylesheet" href="${asset.content}"${id} />`
				);
			} else if (asset.type === AssetType.CSSText) {
				styles[lv].push(`<style type="text/css"${id}>${asset.content}</style>`);
			}
		}
	}

	// 解析资源列表
	parseAssetList(vendors);

	// 生成HTML片段
	const styleFrags = Object.keys(styles)
		.map((key) => `${styles[key].join('\n')}<meta level="${key}" />`)
		.join('');
	const scriptFrags = Object.keys(scripts)
		.map((key) => scripts[key].join('\n'))
		.join('');

	// 写入HTML文档
	doc.open();
	doc.write(
		`
        <!DOCTYPE html>
        <html class="engine-design-mode">
            <head>
                <meta charset="UTF-8"/>
				${styleFrags}
            </head>
            <body>
				${scriptFrags}
			</body>
		</html>
        `
	);
	doc.close();

	return new Promise((resolve) => {
		const renderer = win.SimulatorRenderer;
		if (renderer) {
			// eslint-disable-next-line no-promise-executor-return
			return resolve(renderer);
		}
		const loaded = () => {
			resolve(win.SimulatorRenderer || host.renderer);
			win.removeEventListener('load', loaded);
		};
		win.addEventListener('load', loaded);
	});
}

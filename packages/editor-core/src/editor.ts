import EventEmitter from 'eventemitter2';
import {
	EditorConfig,
	HookConfig,
	IPublicModelEditor,
	IPublicTypeAssetsJson,
	IPublicTypeComponentDescription,
	IPublicTypeEditorGetResult,
	IPublicTypeEditorValueKey,
	IPublicTypeRemoteComponentDescription,
	PluginClassSet,
} from '@arvin/microcode-types';
import { shallowReactive } from 'vue';
import { AssetLoader } from '@arvin/microcode-utils';
import { EventBus, IEventBus } from './event-bus';
import { engineConfig } from './config';
import { globalLocale } from './inti/global-locale';
import { assetsTransform } from './utils';

const keyBlacklist = [
	'designer',
	'skeleton',
	'currentDocument',
	'simulator',
	'plugins',
	'setters',
	'material',
	'innerHotkey',
	'innerPlugins',
];

const AssetsCache: {
	[key: string]: IPublicTypeRemoteComponentDescription;
} = {};

export interface IEditor extends IPublicModelEditor {
	config?: EditorConfig;
	components?: PluginClassSet;
	eventBus: IEventBus;
	init(config?: EditorConfig, components?: PluginClassSet): Promise<any>;
}
export class Editor extends EventEmitter implements IEditor {
	/**
	 * 存储全局状态和资源
	 */
	private context = shallowReactive<Map<IPublicTypeEditorValueKey, any>>(
		new Map<IPublicTypeEditorValueKey, any>()
	);

	get locale() {
		return globalLocale.getLocale();
	}

	config?: EditorConfig;

	eventBus: EventBus;

	components?: PluginClassSet;

	private hooks: HookConfig[] = [];

	private waits = new Map<
		IPublicTypeEditorValueKey,
		Array<{
			once?: boolean;
			resolve: (data: any) => void;
		}>
	>();

	constructor(
		readonly viewName: string = 'global',
		readonly workspaceMode: boolean = false
	) {
		super();
		this.setMaxListeners(200);
		this.eventBus = new EventBus(this);
	}

	get<T = undefined, KeyOrType = any>(
		keyOrType: KeyOrType
	): IPublicTypeEditorGetResult<T, KeyOrType> | undefined {
		return this.context.get(keyOrType as any);
	}

	has(keyOrType: IPublicTypeEditorValueKey): boolean {
		return this.context.has(keyOrType);
	}

	set(key: IPublicTypeEditorValueKey, data: any): void | Promise<void> {
		if (key === 'assets') {
			return this.setAssets(data);
		}
		this.context.set(key, data);
		// 不应存储在配置中的内部实例
		if (!keyBlacklist.includes(key as string)) {
			engineConfig.set(key as string, data);
		}
		this.context.set(key, data);
		this.notifyGot(key);
	}

	async setAssets(assets: IPublicTypeAssetsJson) {
		const { components } = assets;
		if (components && components.length) {
			const componentDescriptions: IPublicTypeComponentDescription[] = [];
			const remoteComponentDescriptions: IPublicTypeRemoteComponentDescription[] =
				[];
			components.forEach((component) => {
				if (!component) {
					return;
				}
				if (component.exportName && component.url) {
					remoteComponentDescriptions.push(component);
				} else {
					componentDescriptions.push(
						component as IPublicTypeComponentDescription
					);
				}
			});
			assets.components = componentDescriptions;

			if (remoteComponentDescriptions && remoteComponentDescriptions.length) {
				await Promise.all(
					remoteComponentDescriptions.map(
						async (component: IPublicTypeRemoteComponentDescription) => {
							const { exportName, url, npm } = component;
							if (!url || !exportName) {
								return;
							}
							if (
								!AssetsCache[exportName] ||
								!npm?.version ||
								AssetsCache[exportName].npm?.version !== npm.version
							) {
								await new AssetLoader().load(url);
							}
							AssetsCache[exportName] = component;

							function setAssetsComponent(
								component: any,
								extraNpmInfo: any = {}
							) {
								const { components } = component;
								if (Array.isArray(components)) {
									components.forEach((d) => {
										assets.components = assets.components.concat({
											npm: {
												...npm,
												...extraNpmInfo,
											},
											...d,
										});
									});
									return;
								}
								if (component.components) {
									assets.components = assets.components.concat({
										npm: {
											...npm,
											...extraNpmInfo,
										},
										...component.components,
									});
								}
							}

							function setArrayAssets(
								value: any[],
								preExportName: string = '',
								preSubName: string = ''
							) {
								value.forEach((d: any, i: number) => {
									const exportName = [preExportName, i.toString()]
										.filter((d) => !!d)
										.join('.');
									const subName = [preSubName, i.toString()]
										.filter((d) => !!d)
										.join('.');
									Array.isArray(d)
										? setArrayAssets(d, exportName, subName)
										: setAssetsComponent(d, {
												exportName,
												subName,
											});
								});
							}

							if ((window as any)[exportName]) {
								if (Array.isArray((window as any)[exportName])) {
									setArrayAssets((window as any)[exportName] as any);
								} else {
									setAssetsComponent((window as any)[exportName] as any);
								}
							}
							return (window as any)[exportName];
						}
					)
				);
			}
		}
		// TODO 转换成符合标准格式的资源对象没有完成
		const innerAssets = assetsTransform(assets);
		this.context.set('assets', innerAssets);
		this.notifyGot('assets');
	}

	/**
	 * 用于监听某个键的数据变化，并在数据变化时调用回调函数。
	 *
	 * @param keyOrType
	 * @param fn
	 * @returns
	 */
	onChange<T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
		keyOrType: KeyOrType,
		fn: (data: IPublicTypeEditorGetResult<T, KeyOrType>) => void
	): () => void {
		this.setWait(keyOrType, fn);
		return () => {
			this.delWait(keyOrType, fn);
		};
	}

	register(data: any, key?: IPublicTypeEditorValueKey): void {
		this.context.set(key || data, data);
		this.notifyGot(key || data);
	}

	async init(config?: EditorConfig, components?: PluginClassSet): Promise<any> {
		this.config = config || {};
		this.components = components || {};

		const { hooks = [], lifeCycles } = this.config;

		this.emit('editor.beforeInit');
		const init = (lifeCycles && lifeCycles.init) || ((): void => {});
		try {
			await init(this);
			// 注册快捷键
			// 注册 hooks
			this.registerHooks(hooks);
			this.emit('editor.afterInit');
			return true;
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
		}
	}

	initHooks = (hooks: HookConfig[]) => {
		this.hooks = hooks.map((hook) => ({
			...hook,
			// 指定第一个参数为 editor
			handler: hook.handler.bind(this, this),
		}));
		return this.hooks;
	};

	registerHooks = (hooks: HookConfig[]) => {
		this.initHooks(hooks).forEach(({ message, type, handler }) => {
			if (['on', 'once'].indexOf(type) !== -1) {
				// 注册一下hook的监听
				this[type](message as any, handler);
			}
		});
	};

	unregisterHooks = () => {
		this.hooks.forEach(({ message, handler }) => {
			this.removeListener(message, handler);
		});
	};

	onceGot<T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
		keyOrType: KeyOrType
	): Promise<IPublicTypeEditorGetResult<T, KeyOrType>> {
		const x = this.context.get(keyOrType);
		if (x !== undefined) {
			return Promise.resolve(x);
		}
		return new Promise((resolve) => {
			this.setWait(keyOrType, resolve, true);
		});
	}

	onGot<T = undefined, KeyOrType extends IPublicTypeEditorValueKey = any>(
		keyOrType: KeyOrType,
		fn: (data: IPublicTypeEditorGetResult<T, KeyOrType>) => void
	): () => void {
		const x = this.context.get(keyOrType);
		if (x !== undefined) {
			fn(x);
		}
		this.setWait(keyOrType, fn);
		return () => {
			this.delWait(keyOrType, fn);
		};
	}

	private notifyGot(key: IPublicTypeEditorValueKey) {
		let waits = this.waits.get(key);
		if (!waits) {
			return;
		}
		waits = waits.slice().reverse();
		let i = waits.length;
		while (i--) {
			waits[i].resolve(this.get(key));
			if (waits[i].once) {
				waits.splice(i, 1);
			}
		}
		if (waits.length > 0) {
			this.waits.set(key, waits);
		} else {
			this.waits.delete(key);
		}
	}

	private setWait(
		key: IPublicTypeEditorValueKey,
		resolve: (data: any) => void,
		once?: boolean
	) {
		const waits = this.waits.get(key);
		if (waits) {
			waits.push({ resolve, once });
		} else {
			this.waits.set(key, [{ resolve, once }]);
		}
	}

	private delWait(key: IPublicTypeEditorValueKey, fn: any) {
		const waits = this.waits.get(key);
		if (!waits) {
			return;
		}
		let i = waits.length;
		while (i--) {
			if (waits[i].resolve === fn) {
				waits.splice(i, 1);
			}
		}
		if (waits.length < 1) {
			this.waits.delete(key);
		}
	}
}

export const commonEvent = new EventBus(new EventEmitter());

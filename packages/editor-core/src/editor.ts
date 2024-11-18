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
} from '@arvin-shu/microcode-types';
import { shallowReactive } from 'vue';
import { AssetLoader } from '@arvin-shu/microcode-utils';
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

	/**
	 * 获取当前语言
	 */
	get locale() {
		return globalLocale.getLocale();
	}

	/**
	 * 编辑器配置
	 */
	config?: EditorConfig;

	/**
	 * 事件总线
	 */
	eventBus: EventBus;

	/**
	 * 插件集合
	 */
	components?: PluginClassSet;

	/**
	 * 钩子集合
	 */
	private hooks: HookConfig[] = [];

	/**
	 * 等待集合
	 */
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

	/**
	 * 获取指定键的值
	 * @param keyOrType 键或类型
	 * @returns 获取到的值
	 */
	get<T = undefined, KeyOrType = any>(
		keyOrType: KeyOrType
	): IPublicTypeEditorGetResult<T, KeyOrType> | undefined {
		return this.context.get(keyOrType as any);
	}

	/**
	 * 检查指定键是否存在
	 * @param keyOrType 键或类型
	 * @returns 是否存在
	 */
	has(keyOrType: IPublicTypeEditorValueKey): boolean {
		return this.context.has(keyOrType);
	}

	/**
	 * 设置指定键的值
	 * @param key 键
	 * @param data 值
	 */
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

	/**
	 * 设置资源配置
	 * @param assets 资源配置对象
	 */
	async setAssets(assets: IPublicTypeAssetsJson) {
		const { components } = assets;
		// 如果存在组件配置
		if (components && components.length) {
			// 用于存储本地组件和远程组件的数组
			const componentDescriptions: IPublicTypeComponentDescription[] = [];
			const remoteComponentDescriptions: IPublicTypeRemoteComponentDescription[] =
				[];
			// 遍历组件配置,区分本地组件和远程组件
			components.forEach((component) => {
				if (!component) {
					return;
				}
				// 如果有 exportName 和 url 则为远程组件
				if (component.exportName && component.url) {
					remoteComponentDescriptions.push(component);
				} else {
					// 否则为本地组件
					componentDescriptions.push(
						component as IPublicTypeComponentDescription
					);
				}
			});
			assets.components = componentDescriptions;

			// 处理远程组件
			if (remoteComponentDescriptions && remoteComponentDescriptions.length) {
				await Promise.all(
					remoteComponentDescriptions.map(
						async (component: IPublicTypeRemoteComponentDescription) => {
							const { exportName, url, npm } = component;
							if (!url || !exportName) {
								return;
							}
							// 检查缓存,如果组件不在缓存中或版本不一致,则重新加载
							if (
								!AssetsCache[exportName] ||
								!npm?.version ||
								AssetsCache[exportName].npm?.version !== npm.version
							) {
								await new AssetLoader().load(url);
							}
							AssetsCache[exportName] = component;

							/**
							 * 设置资源组件
							 * @param component 组件配置
							 * @param extraNpmInfo 额外的 npm 信息
							 */
							function setAssetsComponent(
								component: any,
								extraNpmInfo: any = {}
							) {
								const { components } = component;
								// 处理组件数组
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
								// 处理单个组件
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

							/**
							 * 设置数组类型的资源
							 * @param value 资源数组
							 * @param preExportName 前缀导出名
							 * @param preSubName 前缀子名
							 */
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
									// 递归处理数组
									Array.isArray(d)
										? setArrayAssets(d, exportName, subName)
										: setAssetsComponent(d, {
												exportName,
												subName,
											});
								});
							}

							// 处理全局导出的组件
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
		// 设置资源到上下文
		this.context.set('assets', innerAssets);
		// 通知资源更新
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

	/**
	 * 初始化编辑器
	 *
	 * @param config 编辑器配置项,包含生命周期和钩子函数等
	 * @param components 组件集合
	 * @returns Promise<boolean> 初始化是否成功
	 */
	async init(config?: EditorConfig, components?: PluginClassSet): Promise<any> {
		// 初始化配置和组件
		this.config = config || {};
		this.components = components || {};

		// 从配置中获取钩子函数和生命周期函数
		const { hooks = [], lifeCycles } = this.config;

		// 触发初始化前事件
		this.emit('editor.beforeInit');
		// 获取初始化生命周期函数,如果没有则使用空函数
		const init = (lifeCycles && lifeCycles.init) || ((): void => {});
		try {
			// 执行初始化函数
			await init(this);
			// TODO: 注册快捷键
			// 注册钩子函数
			this.registerHooks(hooks);
			// 触发初始化完成事件
			this.emit('editor.afterInit');
			return true;
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
		}
	}

	/**
	 * 初始化钩子函数
	 * @param hooks 钩子函数配置
	 * @returns 钩子函数集合
	 */
	initHooks = (hooks: HookConfig[]) => {
		this.hooks = hooks.map((hook) => ({
			...hook,
			// 指定第一个参数为 editor
			handler: hook.handler.bind(this, this),
		}));
		return this.hooks;
	};

	/**
	 * 注册钩子函数
	 * @param hooks 钩子函数配置
	 * @returns 钩子函数集合
	 */
	registerHooks = (hooks: HookConfig[]) => {
		this.initHooks(hooks).forEach(({ message, type, handler }) => {
			// 调用eventemitter2的on和once方法注册事件
			if (['on', 'once'].indexOf(type) !== -1) {
				// 注册一下hook的监听
				this[type](message as any, handler);
			}
		});
	};

	/**
	 * 注销钩子函数
	 */
	unregisterHooks = () => {
		this.hooks.forEach(({ message, handler }) => {
			this.removeListener(message, handler);
		});
	};

	/**
	 * 获取指定键的值,如果值不存在则等待获取
	 * @param keyOrType 键或类型
	 * @returns 获取到的值
	 */
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

	/**
	 * 获取指定键的值,如果值不存在则等待获取
	 * @param keyOrType 键或类型
	 * @param fn 回调函数
	 * @returns 注销函数
	 */
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

	/**
	 * 通知获取指定键的值
	 * @param key 键
	 */
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

	/**
	 * 设置等待获取指定键的值
	 * @param key 键
	 * @param resolve 回调函数
	 * @param once 是否只执行一次
	 */
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

	/**
	 * 删除等待获取指定键的值
	 * @param key 键
	 * @param fn 回调函数
	 */
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

/**
 * 全局事件总线
 */
export const commonEvent = new EventBus(new EventEmitter());

import EventEmitter from 'eventemitter2';
import {
	EditorConfig,
	HookConfig,
	IPublicModelEditor,
	IPublicTypeAssetsJson,
	IPublicTypeEditorGetResult,
	IPublicTypeEditorValueKey,
	PluginClassSet,
} from '@arvin/microcode-types';
import { shallowRef } from 'vue';
import { EventBus, IEventBus } from './event-bus';
import { engineConfig } from './config';
import { globalLocale } from './inti/global-locale';

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
	private context = shallowRef<Map<IPublicTypeEditorValueKey, any>>(
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
		return this.context.value.get(keyOrType as any);
	}

	has(keyOrType: IPublicTypeEditorValueKey): boolean {
		return this.context.value.has(keyOrType);
	}

	set(key: IPublicTypeEditorValueKey, data: any): void | Promise<void> {
		if (key === 'assets') {
			return this.setAssets(data);
		}
		this.context.value.set(key, data);
		// 不应存储在配置中的内部实例
		if (!keyBlacklist.includes(key as string)) {
			engineConfig.set(key as string, data);
		}
		this.context.value.set(key, data);
		this.notifyGot(key);
	}

	async setAssets(assets: IPublicTypeAssetsJson) {
		console.log(assets);
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
		this.context.value.set(key || data, data);
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
		const x = this.context.value.get(keyOrType);
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
		const x = this.context.value.get(keyOrType);
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

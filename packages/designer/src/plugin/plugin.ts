import {
	IPublicTypePluginConfig,
	IPublicTypePluginMeta,
} from '@arvin-shu/microcode-types';
import { getLogger, Logger } from '@arvin-shu/microcode-utils';
import { IMicrocodePluginManager, IMicrocodePluginRuntime } from '.';
import { invariant } from '../utils';

/**
 * 是插件系统的核心运行时，
 * 负责管理插件的生命周期（注册、初始化、销毁等）、
 * 依赖解析、状态控制（禁用、启用）以及插件功能的导出
 */
export class MicrocodePluginRuntime implements IMicrocodePluginRuntime {
	config: IPublicTypePluginConfig;

	private pluginName: string;

	private manager: IMicrocodePluginManager;

	meta: IPublicTypePluginMeta;

	logger: Logger;

	/**
	 * 是否初始化过
	 */
	private _inited: boolean;

	/**
	 * 标识插件状态，是否被 disabled
	 */
	private _disabled: boolean;

	constructor(
		pluginName: string,
		manager: IMicrocodePluginManager,
		config: IPublicTypePluginConfig,
		meta: IPublicTypePluginMeta
	) {
		this.pluginName = pluginName;
		this.config = config;
		this.manager = manager;
		this.meta = meta;
		this.logger = getLogger({ level: 'warn', bizName: `plugin:${pluginName}` });
	}

	get dep() {
		if (typeof this.meta.dependencies === 'string') {
			return [this.meta.dependencies];
		}
		const legacyDepValue = (this.config as any).dep;
		if (typeof legacyDepValue === 'string') {
			return [legacyDepValue];
		}
		return this.meta.dependencies || legacyDepValue || [];
	}

	get disabled() {
		return this._disabled;
	}

	isInited() {
		return this._inited;
	}

	async init(forceInit?: boolean) {
		if (this._inited && !forceInit) return;
		this.logger.log('method init called');
		await this.config.init?.call(undefined);
		this._inited = true;
	}

	async destroy() {
		if (!this._inited) return;
		this.logger.log('method destroy called');
		await this.config?.destroy?.call(undefined);
		this._inited = false;
	}

	setDisabled(flag = true) {
		this._disabled = flag;
	}

	get name() {
		return this.pluginName;
	}

	/**
	 * 在插件管理器中移除这个插件
	 */
	async dispose() {
		await this.manager.delete(this.name);
	}

	/**
	 * 调用代理对象获得exports函数中配置的信息
	 */
	toProxy() {
		invariant(this._inited, 'Could not call toProxy before init');
		const exports = this.config.exports?.();
		return new Proxy(this, {
			get(target, prop, receiver) {
				if ({}.hasOwnProperty.call(exports, prop)) {
					return exports?.[prop as string];
				}
				return Reflect.get(target, prop, receiver);
			},
		});
	}
}

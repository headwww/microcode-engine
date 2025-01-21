import {
	IPublicModelEngineConfig,
	IPublicModelPreference,
	IPublicTypeEngineOptions,
} from '@arvin-shu/microcode-types';
import { getLogger, isPlainObject } from '@arvin-shu/microcode-utils';
import { get as lodashGet } from 'lodash-es';
import Preference from './utils/preference';

const STRICT_PLUGIN_MODE_DEFAULT = true;

//  在严格模式下使用，此时只能接受此VALID_ENGINE_OPTIONS中的选项
//  类型和描述仅用于开发人员的帮助，不会影响运行时
const VALID_ENGINE_OPTIONS = {
	enableCondition: {
		type: 'boolean',
		description:
			'是否开启 condition 的能力，默认在设计器中不管 condition 是啥都正常展示',
	},
	designMode: {
		type: 'string',
		enum: ['design', 'live'],
		default: 'design',
		description: '设计模式，live 模式将会实时展示变量值',
	},
	device: {
		type: 'string',
		enum: ['default', 'mobile', 'any string value'],
		default: 'default',
		description: '设备类型',
	},
	deviceClassName: {
		type: 'string',
		default: undefined,
		description: '指定初始化的 deviceClassName，挂载到画布的顶层节点上',
	},
	locale: {
		type: 'string',
		default: 'zh-CN',
		description: '语言',
	},
	renderEnv: {
		type: 'string',
		enum: ['react', 'any string value'],
		default: 'react',
		description: '渲染器类型',
	},
	deviceMapper: {
		type: 'object',
		description: '设备类型映射器，处理设计器与渲染器中 device 的映射',
	},
	enableStrictPluginMode: {
		type: 'boolean',
		default: STRICT_PLUGIN_MODE_DEFAULT,
		description:
			'开启严格插件模式，默认值：STRICT_PLUGIN_MODE_DEFAULT , 严格模式下，插件将无法通过 engineOptions 传递自定义配置项',
	},
	enableReactiveContainer: {
		type: 'boolean',
		default: false,
		description: '开启拖拽组件时，即将被放入的容器是否有视觉反馈',
	},
	disableAutoRender: {
		type: 'boolean',
		default: false,
		description: '关闭画布自动渲染，在资产包多重异步加载的场景有效',
	},
	disableDetecting: {
		type: 'boolean',
		default: false,
		description: '关闭拖拽组件时的虚线响应，性能考虑',
	},
	customizeIgnoreSelectors: {
		type: 'function',
		default: undefined,
		description:
			'定制画布中点击被忽略的 selectors, eg. (defaultIgnoreSelectors: string[], e: MouseEvent) => string[]',
	},
	disableDefaultSettingPanel: {
		type: 'boolean',
		default: false,
		description: '禁止默认的设置面板',
	},
	disableDefaultSetters: {
		type: 'boolean',
		default: false,
		description: '禁止默认的设置器',
	},
	enableCanvasLock: {
		type: 'boolean',
		default: false,
		description: '打开画布的锁定操作',
	},
	enableLockedNodeSetting: {
		type: 'boolean',
		default: false,
		description:
			'容器锁定后，容器本身是否可以设置属性，仅当画布锁定特性开启时生效',
	},
	stayOnTheSameSettingTab: {
		type: 'boolean',
		default: false,
		description: '当选中节点切换时，是否停留在相同的设置 tab 上',
	},
	hideSettingsTabsWhenOnlyOneItem: {
		type: 'boolean',
		description: '是否在只有一个 item 的时候隐藏设置 tabs',
	},
	loadingComponent: {
		type: 'ComponentType',
		default: undefined,
		description: '自定义 loading 组件',
	},
	supportVariableGlobally: {
		type: 'boolean',
		default: false,
		description: '设置所有属性支持变量配置',
	},
	visionSettings: {
		type: 'object',
		description: 'Vision-polyfill settings',
	},
	simulatorUrl: {
		type: 'array',
		description: '自定义 simulatorUrl 的地址',
	},
	appHelper: {
		type: 'object',
		description: '定义 utils 和 constants 等对象',
	},
	requestHandlersMap: {
		type: 'object',
		description: '数据源引擎的请求处理器映射',
	},
	thisRequiredInJSE: {
		type: 'boolean',
		description: 'JSExpression 是否只支持使用 this 来访问上下文变量',
	},
	enableStrictNotFoundMode: {
		type: 'boolean',
		description: '当开启组件未找到严格模式时，渲染模块不会默认给一个容器组件',
	},
	focusNodeSelector: {
		type: 'function',
		description: '配置指定节点为根组件',
	},
	enableAutoOpenFirstWindow: {
		type: 'boolean',
		description: '应用级设计模式下，自动打开第一个窗口',
		default: true,
	},
	enableWorkspaceMode: {
		type: 'boolean',
		description: '是否开启应用级设计模式',
		default: false,
	},
	workspaceEmptyComponent: {
		type: 'function',
		description: '应用级设计模式下，窗口为空时展示的占位组件',
	},
	enableContextMenu: {
		type: 'boolean',
		description: '是否开启右键菜单',
		default: false,
	},
	hideComponentAction: {
		type: 'boolean',
		description: '是否隐藏设计器辅助层',
		default: false,
	},
};

const logger = getLogger({ level: 'log', bizName: 'config' });

const getStrictModeValue = (
	engineOptions: IPublicTypeEngineOptions,
	defaultValue: boolean
): boolean => {
	if (!engineOptions || !isPlainObject(engineOptions)) {
		return defaultValue;
	}
	if (
		engineOptions.enableStrictPluginMode === undefined ||
		engineOptions.enableStrictPluginMode === null
	) {
		return defaultValue;
	}
	return engineOptions.enableStrictPluginMode;
};

export interface IEngineConfig extends IPublicModelEngineConfig {
	/**
	 * if engineOptions.strictPluginMode === true, only accept propertied predefined in EngineOptions.
	 *
	 * @param {IPublicTypeEngineOptions} engineOptions
	 */
	setEngineOptions(engineOptions: IPublicTypeEngineOptions): void;

	notifyGot(key: string): void;

	setWait(key: string, resolve: (data: any) => void, once?: boolean): void;

	delWait(key: string, fn: any): void;
}

/**
 * 管理低代码引擎中的配置项，支持严格模式下的配置项校验，
 * 且提供异步获取配置值的能力，非常适合复杂配置管理场景。
 */

export class EngineConfig implements IEngineConfig {
	/**
	 * 配置项
	 */
	private config: { [key: string]: any } = {};

	/**
	 * 这是一个等待队列，用于管理那些需要等待某个配置项赋值的回调。
	 */
	private waits = new Map<
		string,
		Array<{
			once?: boolean;
			resolve: (data: any) => void;
		}>
	>();

	/**
	 * 存储 preference
	 */
	readonly preference: IPublicModelPreference;

	constructor(config?: { [key: string]: any }) {
		this.config = config || {};
		this.preference = new Preference();
	}

	/**
	 * 设置引擎配置
	 *
	 * @param engineOptions 引擎配置对象
	 */
	setEngineOptions(engineOptions: IPublicTypeEngineOptions): void {
		// 不是一个有效的纯对象
		if (!engineOptions || !isPlainObject(engineOptions)) {
			return;
		}
		const strictMode =
			getStrictModeValue(engineOptions, STRICT_PLUGIN_MODE_DEFAULT) === true;
		if (strictMode) {
			// 严格模式
			const isValidKey = (key: string) => {
				const result = (VALID_ENGINE_OPTIONS as any)[key];
				return !(result === undefined || result === null);
			};
			Object.keys(engineOptions).forEach((key) => {
				if (isValidKey(key)) {
					this.set(key, (engineOptions as any)[key]);
				} else {
					logger.warn(
						`failed to config ${key} to engineConfig, only predefined options can be set under strict mode, predefined options: `,
						VALID_ENGINE_OPTIONS
					);
				}
			});
		} else {
			this.setConfig(engineOptions);
		}
	}

	/**
	 * 判断指定 key 是否有值
	 * @param key
	 */
	has(key: string): boolean {
		return this.config[key] !== undefined;
	}

	/**
	 * 获取指定 key 的值
	 * @param key
	 * @param defaultValue
	 */
	get(key: string, defaultValue?: any): any {
		return lodashGet(this.config, key, defaultValue);
	}

	/**
	 * 设置指定 key 的值
	 * @param key
	 * @param value
	 */
	set(key: string, value: any) {
		this.config[key] = value;
		this.notifyGot(key);
	}

	/**
	 * 批量设值，set 的对象版本
	 * @param config
	 */
	setConfig(config: { [key: string]: any }) {
		if (config) {
			Object.keys(config).forEach((key) => {
				this.set(key, config[key]);
			});
		}
	}

	/**
	 * 获取指定 key 的值，若此时还未赋值，则等待，若已有值，则直接返回值
	 *  注：此函数返回 Promise 实例，只会执行（fullfill）一次
	 * @param key
	 * @returns
	 */
	onceGot(key: string): Promise<any> {
		const val = this.config[key];
		if (val !== undefined) {
			return Promise.resolve(val);
		}
		return new Promise((resolve) => {
			this.setWait(key, resolve, true);
		});
	}

	/**
	 * 获取指定 key 的值，函数回调模式，若多次被赋值，回调会被多次调用
	 *
	 * @param key
	 * @param fn
	 * @returns
	 */
	onGot(key: string, fn: (data: any) => void): () => void {
		const val = this.config?.[key];
		if (val !== undefined) {
			fn(val);
		}
		this.setWait(key, fn);
		return () => {
			this.delWait(key, fn);
		};
	}

	/**
	 * 通知获取指定键的值
	 * @param key 键
	 */
	notifyGot(key: string): void {
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
	setWait(key: string, resolve: (data: any) => void, once?: boolean) {
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
	delWait(key: string, fn: any) {
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

	/**
	 * 获取偏好设置
	 * @returns 偏好设置对象
	 */
	getPreference(): IPublicModelPreference {
		return this.preference;
	}
}

export const engineConfig = new EngineConfig();

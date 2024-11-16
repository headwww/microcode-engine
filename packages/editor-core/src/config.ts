import {
	IPublicModelEngineConfig,
	IPublicModelPreference,
	IPublicTypeEngineOptions,
} from '@arvin/microcode-types';
import { getLogger, isPlainObject } from '@arvin/microcode-utils';
import { get as lodashGet } from 'lodash-es';
import Preference from './utils/preference';

const STRICT_PLUGIN_MODE_DEFAULT = true;

// 在严格模式下使用，此时只能接受此VALID_ENGINE_options中的选项
// 类型和描述仅用于开发人员的帮助，不会影响运行时
const VALID_ENGINE_OPTIONS = {};

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
	 * // TODO IPublicTypeEngineOptions还没有明确哪些配置需要设置
	 * 设置引擎配置
	 *
	 * @param engineOptions 引擎配置对象
	 */
	setEngineOptions(engineOptions: IPublicTypeEngineOptions): void {
		// 不是一个有效的纯对象
		if (engineOptions || !isPlainObject(engineOptions)) {
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

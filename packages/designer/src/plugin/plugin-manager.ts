import {
	IPublicTypePlugin,
	IPublicTypePluginMeta,
	IPublicTypePluginRegisterOptions,
	IPublicTypePreferenceValueType,
} from '@arvin-shu/microcode-types';
import { getLogger } from '@arvin-shu/microcode-utils';
import { engineConfig } from '@arvin-shu/microcode-editor-core';
import semverSatisfies from 'semver/functions/satisfies';
import {
	filterValidOptions,
	IMicrocodePluginManager,
	IMicrocodePluginRuntime,
	IMicroodePluginContextApiAssembler,
	IPluginContextOptions,
	MicrocodePluginRuntime,
	PluginPreference,
	RESERVED_EVENT_PREFIX,
} from '.';
import MicrocodePluginContext from './plugin-context';
import { invariant } from '../utils';
import sequencify from './sequencify';

const logger = getLogger({ level: 'warn', bizName: 'designer:pluginManager' });

/**
 * 微码引擎的插件机制，插件管理器
 */
export class MicrocodePluginManager implements IMicrocodePluginManager {
	/**
	 * 插件实例（按照顺序存储）
	 */
	private plugins: IMicrocodePluginRuntime[] = [];

	/**
	 * 插件实例存储器（方便快速定位到插件）
	 */
	pluginsMap: Map<string, IMicrocodePluginRuntime> = new Map();

	/**
	 * 插件的偏好设置
	 */
	private pluginPreference?: PluginPreference = new Map();

	/**
	 * 引擎上下文存储器
	 */
	pluginContextMap: Map<string, MicrocodePluginContext> = new Map();

	/**
	 * 传递到外部用来设置引擎上下文的回调接口
	 */
	contextApiAssembler: IMicroodePluginContextApiAssembler;

	constructor(
		contextApiAssembler: IMicroodePluginContextApiAssembler,
		readonly viewName = 'global'
	) {
		this.contextApiAssembler = contextApiAssembler;
	}

	/**
	 * 获取上下文
	 */
	_getMicrocodePluginContext = (options: IPluginContextOptions) => {
		const { pluginName } = options;
		let context = this.pluginContextMap.get(pluginName);
		if (!context) {
			context = new MicrocodePluginContext(options, this.contextApiAssembler);
			this.pluginContextMap.set(pluginName, context);
		}
		return context;
	};

	/**
	 * 验证版本
	 */
	isEngineVersionMatched(versionExp: string): boolean {
		const engineVersion = engineConfig.get('ENGINE_VERSION');
		return semverSatisfies(engineVersion, versionExp, {
			includePrerelease: true,
		});
	}

	/**
	 * 注册插件
	 *
	 * @param pluginModel 插件的构造和一些配置如插件名称和meta数据
	 * @param options 插件的配置项
	 * @param registerOptions 插件的注册选项，用于控制插件的行为（例如是否覆盖已有插件，是否自动初始化）。
	 */
	async register(
		pluginModel: IPublicTypePlugin,
		options?: any,
		registerOptions?: IPublicTypePluginRegisterOptions
	): Promise<void> {
		let { pluginName } = pluginModel;
		const { meta = {} as IPublicTypePluginMeta } = pluginModel;
		const { eventPrefix, preferenceDeclaration, engines } = meta;

		const isReservedPrefix = RESERVED_EVENT_PREFIX.find(
			(item) => item === eventPrefix
		);
		// 判断插件设置的事件前缀是否合法
		if (isReservedPrefix) {
			meta.eventPrefix = undefined;
			logger.warn(
				`plugin ${pluginName} is trying to use ${eventPrefix} as event prefix, which is a reserved event prefix, please use another one`
			);
		}
		const ctx = this._getMicrocodePluginContext({ pluginName, meta });
		// 插件用户偏好设置过滤器，无自定义的话则使用默认的filterValidOptions过滤器
		const customFilterValidOptions = engineConfig.get(
			'customPluginFilterOptions',
			filterValidOptions
		);
		// 自定义的插件转换器，在pluginModel的基础上做二次转换，没有设置则默认用pluginModel处理
		const pluginTransducer = engineConfig.get('customPluginTransducer', null);
		const newPluginModel = pluginTransducer
			? await pluginTransducer(pluginModel, ctx, options)
			: pluginModel;
		const newOptions = customFilterValidOptions(
			options,
			newPluginModel.meta?.preferenceDeclaration
		);
		const config = newPluginModel(ctx, newOptions);

		// pluginModel.pluginName没设置插件名称则去pluginModel返回对象中找name
		pluginName = pluginName || config.name;
		invariant(pluginName, 'pluginConfigCreator.pluginName required', config);

		ctx.setPreference(pluginName, preferenceDeclaration);

		// 覆盖相同名字的插件
		const allowOverride = registerOptions?.override === true;
		if (this.pluginsMap.has(pluginName)) {
			if (!allowOverride) {
				throw new Error(`Plugin with name ${pluginName} exists`);
			} else {
				// 找到这个插件清除原来的插件
				const originalPlugin = this.pluginsMap.get(pluginName);
				logger.log(
					'plugin override, originalPlugin with name ',
					pluginName,
					' will be destroyed, config:',
					originalPlugin?.config
				);
				originalPlugin?.destroy();
				this.pluginsMap.delete(pluginName);
			}
		}

		// 检查插件和引擎版本是否兼容，使用 major、minor 和 patch语义话
		const engineVersionExp = engines && engines.microcodeEngine;
		if (engineVersionExp && !this.isEngineVersionMatched(engineVersionExp)) {
			throw new Error(
				`plugin ${pluginName} skipped, engine check failed, current engine version is ${engineConfig.get('ENGINE_VERSION')}, meta.engines.microcodeEngine is ${engineVersionExp}`
			);
		}

		const plugin = new MicrocodePluginRuntime(pluginName, this, config, meta);

		// 是否在注册时自动初始化
		if (registerOptions?.autoInit) {
			await plugin.init();
		}

		this.plugins.push(plugin);
		this.pluginsMap.set(pluginName, plugin);
		// 打印注册日志
		logger.log(
			`plugin registered with pluginName: ${pluginName}, config: `,
			config,
			'meta:',
			meta
		);
	}

	/**
	 * 初始化所有插件
	 *
	 * @param pluginPreference
	 */
	async init(
		pluginPreference?: Map<
			string,
			Record<string, IPublicTypePreferenceValueType>
		>
	): Promise<void> {
		const pluginNames: string[] = [];
		const pluginObj: { [name: string]: IMicrocodePluginRuntime } = {};
		this.pluginPreference = pluginPreference;
		this.plugins.forEach((plugin) => {
			pluginNames.push(plugin.name);
			pluginObj[plugin.name] = plugin;
		});

		// 根据插件的依赖关系来实现插件初始化顺序
		// sequence插件执行的顺序
		// missingTasks缺失的任务
		const { missingTasks, sequence } = sequencify(pluginObj, pluginNames);
		invariant(!missingTasks.length, 'plugin dependency missing', missingTasks);
		logger.log('load plugin sequence:', sequence);

		// 初始化插件

		for (const pluginName of sequence) {
			try {
				await this.pluginsMap.get(pluginName)!.init();
			} catch (e) /* istanbul ignore next */ {
				logger.error(
					`Failed to init plugin:${pluginName}, it maybe affect those plugins which depend on this.`
				);
				logger.error(e);
			}
		}
	}

	/**
	 * 获取指定名称的插件实例
	 *
	 * @param pluginName 插件名称
	 */
	get(pluginName: string): IMicrocodePluginRuntime | undefined {
		return this.pluginsMap.get(pluginName);
	}

	/**
	 * 获取所有实例
	 */
	getAll(): IMicrocodePluginRuntime[] {
		return this.plugins;
	}

	/**
	 * 判断该插件是否存在
	 *
	 * @param pluginName 插件名称
	 * @returns
	 */
	has(pluginName: string): boolean {
		return this.pluginsMap.has(pluginName);
	}

	/**
	 * 删除指定名称的插件，并销毁其资源。
	 *
	 * @param pluginName 插件名称
	 */
	async delete(pluginName: string): Promise<boolean> {
		const plugin = this.plugins.find(({ name }) => name === pluginName);
		if (!plugin) return false;
		await plugin.destroy();
		const idx = this.plugins.indexOf(plugin);
		this.plugins.splice(idx, 1);
		return this.pluginsMap.delete(pluginName);
	}

	/**
	 * 销毁所有已注册的插件
	 */
	async destroy() {
		for (const plugin of this.plugins) {
			// eslint-disable-next-line no-await-in-loop
			await plugin.destroy();
		}
	}

	/**
	 * 返回已注册插件的数量
	 */
	get size() {
		return this.pluginsMap.size;
	}

	setDisabled(pluginName: string, flag = true) {
		logger.warn(`plugin:${pluginName} has been set disable:${flag}`);
		this.pluginsMap.get(pluginName)?.setDisabled(flag);
	}

	/**
	 * 获取插件的偏好设置（配置项）
	 *
	 * @param pluginName
	 * @returns
	 */
	getPluginPreference(
		pluginName: string
	): Record<string, IPublicTypePreferenceValueType> | null | undefined {
		if (!this.pluginPreference) {
			return null;
		}
		return this.pluginPreference.get(pluginName);
	}

	/**
	 * 销毁所有插件并清空管理器
	 *
	 */
	async dispose() {
		await this.destroy();
		this.plugins = [];
		this.pluginsMap.clear();
	}

	/**
	 * 为插件管理器创建一个代理，禁用状态的插件将不会返回有效实例
	 *
	 * @returns
	 */
	toProxy() {
		return new Proxy(this, {
			get(target, prop, receiver) {
				if (target.pluginsMap.has(prop as string)) {
					// 禁用态的插件，直接返回 undefined
					if (target.pluginsMap.get(prop as string)!.disabled) {
						return undefined;
					}
					return target.pluginsMap.get(prop as string)?.toProxy();
				}
				return Reflect.get(target, prop, receiver);
			},
		});
	}
}

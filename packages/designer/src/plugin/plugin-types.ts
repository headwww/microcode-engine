import {
	IPublicApiCanvas,
	IPublicApiEvent,
	IPublicApiLogger,
	IPublicApiMaterial,
	IPublicApiPlugins,
	IPublicApiProject,
	IPublicApiSetters,
	IPublicApiSkeleton,
	IPublicModelEngineConfig,
	IPublicTypePlugin,
	IPublicTypePluginConfig,
	IPublicTypePluginMeta,
	IPublicTypePluginRegisterOptions,
	IPublicTypePreferenceValueType,
} from '@arvin-shu/microcode-types';
import PluginContext from './plugin-context';

export interface IMicrocodePluginManagerCore {
	register(
		pluginModel: IPublicTypePlugin,
		options?: any,
		registerOptions?: IPublicTypePluginRegisterOptions
	): Promise<void>;
	init(
		pluginPreference?: Map<
			string,
			Record<string, IPublicTypePreferenceValueType>
		>
	): Promise<void>;
	get(pluginName: string): IMicrocodePluginRuntime | undefined;
	getAll(): IMicrocodePluginRuntime[];
	has(pluginName: string): boolean;
	delete(pluginName: string): any;
	setDisabled(pluginName: string, flag: boolean): void;
	dispose(): void;
	_getMicrocodePluginContext(options: IPluginContextOptions): PluginContext;
}

interface IMicrocodePluginManagerPluginAccessor {
	[pluginName: string]: IMicrocodePluginRuntime | any;
}

export type IMicrocodePluginManager = IMicrocodePluginManagerCore &
	IMicrocodePluginManagerPluginAccessor;

export interface IMicrocodePluginRuntimeCore {
	name: string;
	dep: string[];
	disabled: boolean;
	config: IPublicTypePluginConfig;
	logger: IPublicApiLogger;
	meta: IPublicTypePluginMeta;
	init(forceInit?: boolean): void;
	isInited(): boolean;
	destroy(): void;
	toProxy(): any;
	setDisabled(flag: boolean): void;
}

interface IMicrocodePluginRuntimeExportsAccessor {
	[propName: string]: any;
}

export type IMicrocodePluginRuntime = IMicrocodePluginRuntimeCore &
	IMicrocodePluginRuntimeExportsAccessor;

export type PluginPreference = Map<
	string,
	Record<string, IPublicTypePreferenceValueType>
>;

export interface IMicrocodeContextPrivate {
	set setters(setters: IPublicApiSetters);
	set skeleton(skeleton: IPublicApiSkeleton);
	set plugins(plugins: IPublicApiPlugins);
	set material(material: IPublicApiMaterial);
	set canvas(material: IPublicApiCanvas);
	set config(config: IPublicModelEngineConfig);
	set event(event: IPublicApiEvent);
	set logger(logger: IPublicApiLogger);
	set pluginEvent(pluginEvent: IPublicApiEvent);
	set project(project: IPublicApiProject);
}

export interface IPluginContextOptions {
	pluginName: string;
	meta?: IPublicTypePluginMeta;
}

export interface IMicroodePluginContextApiAssembler {
	assembleApis(
		context: IMicrocodeContextPrivate,
		pluginName: string,
		meta?: IPublicTypePluginMeta
	): void;
}

// 保留的事件前缀
export const RESERVED_EVENT_PREFIX = [
	'designer',
	'editor',
	'skeleton',
	'renderer',
	'render',
	'utils',
	'plugin',
	'engine',
	'editor-core',
	'engine-core',
	'plugins',
	'event',
	'events',
	'log',
	'logger',
	'ctx',
	'context',
];

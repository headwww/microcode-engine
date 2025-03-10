import {
	IPluginPreferenceMananger,
	IPublicApiCanvas,
	IPublicApiEvent,
	IPublicApiHotkey,
	IPublicApiLogger,
	IPublicApiMaterial,
	IPublicApiPlugins,
	IPublicApiProject,
	IPublicApiSetters,
	IPublicApiSkeleton,
	IPublicModelEngineConfig,
	IPublicModelPluginContext,
	IPublicTypePluginDeclaration,
	IPublicTypePreferenceValueType,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	engineConfig,
} from '@arvin-shu/microcode-editor-core';
import {
	IMicrocodeContextPrivate,
	IMicroodePluginContextApiAssembler,
	IPluginContextOptions,
	isValidPreferenceKey,
} from '.';

/**
 * 引擎的上下文
 */
export default class PluginContext
	implements IPublicModelPluginContext, IMicrocodeContextPrivate
{
	hotkey: IPublicApiHotkey;

	project: IPublicApiProject;

	skeleton: IPublicApiSkeleton;

	preference: IPluginPreferenceMananger;

	setters: IPublicApiSetters;

	plugins: IPublicApiPlugins;

	config: IPublicModelEngineConfig;

	event: IPublicApiEvent;

	pluginEvent: IPublicApiEvent;

	canvas: IPublicApiCanvas;

	logger: IPublicApiLogger;

	material: IPublicApiMaterial;

	constructor(
		options: IPluginContextOptions,
		contextApiAssembler: IMicroodePluginContextApiAssembler
	) {
		const { pluginName = 'anonymous', meta } = options;
		contextApiAssembler.assembleApis(this, pluginName, meta);
		this.pluginEvent = createModuleEventBus(pluginName, 200);
		const enhancePluginContextHook = engineConfig.get(
			'enhancePluginContextHook'
		);
		if (enhancePluginContextHook) {
			enhancePluginContextHook(this);
		}
	}

	/**
	 * 全局设置的偏好设置
	 *
	 * @param pluginName
	 * @param preferenceDeclaration
	 */
	setPreference(
		pluginName: string,
		preferenceDeclaration: IPublicTypePluginDeclaration
	) {
		const getPreferenceValue = (
			key: string,
			defaultValue?: IPublicTypePreferenceValueType
		): IPublicTypePreferenceValueType | undefined => {
			// 先判断插件有没有定义key类型
			if (!isValidPreferenceKey(key, preferenceDeclaration)) {
				return undefined;
			}
			const pluginPreference =
				this.plugins.getPluginPreference(pluginName) || {};
			if (
				pluginPreference[key] === undefined ||
				pluginPreference[key] === null
			) {
				return defaultValue;
			}
			return pluginPreference[key];
		};

		this.preference = {
			getPreferenceValue,
		};
	}
}

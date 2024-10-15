import {
	IPluginPreferenceMananger,
	IPublicApiPlugins,
	IPublicModelPluginContext,
	IPublicTypePluginDeclaration,
	IPublicTypePreferenceValueType,
} from '@arvin/microcode-types';
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
	plugins: IPublicApiPlugins;

	preference: IPluginPreferenceMananger;

	constructor(
		options: IPluginContextOptions,
		contextApiAssembler: IMicroodePluginContextApiAssembler
	) {
		const { pluginName = 'anonymous', meta } = options;
		contextApiAssembler.assembleApis(this, pluginName, meta);
	}

	setPreference(
		pluginName: string,
		preferenceDeclaration: IPublicTypePluginDeclaration
	) {
		const getPreferenceValue = (
			key: string,
			defaultValue?: IPublicTypePreferenceValueType
		): IPublicTypePreferenceValueType | undefined => {
			// 先判断插件有没有定义
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

import { IPluginPreferenceMananger, IPublicApiPlugins } from '../api';

export interface IPublicModelPluginContext {
	/**
	 * 可通过该对象读取插件初始化配置
	 */
	preference: IPluginPreferenceMananger;

	get plugins(): IPublicApiPlugins;
}

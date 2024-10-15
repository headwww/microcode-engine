import { IPublicTypePluginCreater, IPublicTypePluginMeta } from '.';

/**
 * 描述插件的配置结构
 */
export interface IPublicTypePlugin extends IPublicTypePluginCreater {
	/**
	 * 插件名称
	 */
	pluginName: string;

	/**
	 * 插件配置声明信息
	 */
	meta?: IPublicTypePluginMeta;
}

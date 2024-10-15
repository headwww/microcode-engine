import { IPublicTypePluginDeclarationProperty } from '.';

/**
 * 插件配置
 * 用于定义插件的配置声明，描述插件的用户偏好项，可以通过配置 UI 展示给用户。
 * 当strictPluginMode===true时，只能从插件内部获得声明的首选项。
 */
export interface IPublicTypePluginDeclaration {
	/**
	 * 偏好项的标题，通常会显示在配置 UI 上。
	 */
	title: string;

	/**
	 *  定义插件配置的属性
	 */
	properties: IPublicTypePluginDeclarationProperty[];
}

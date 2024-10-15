import { IPublicTypePluginDeclaration } from '.';

export interface IPublicTypePluginMeta {
	/**
	 * 定义插件所依赖的其他插件，如果插件有依赖项加载时会按照依赖顺利进行初始化
	 */
	dependencies?: string[];

	/**
	 * 制定插件与哪个版本的引擎兼容
	 */
	engines?: {
		microcodeEngine?: string;
	};

	/**
	 * 定义插件的配置声明，用于配置插件的用户偏好项
	 */
	preferenceDeclaration: IPublicTypePluginDeclaration;

	/**
	 * 指定插件的事件前缀。如果未设置，会默认为 'common'，建议使用插件名称作为事件前缀。
	 */
	eventPrefix?: string;

	/**
	 * 定义插件的命令作用域（commandScope）。当插件需要注册命令时，必须在 meta 中定义 commandScope
	 */
	commandScope?: string;
}

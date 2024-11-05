import { IPublicTypeIconType } from './icon-type';
import { IPublicTypeNpmInfo } from './npm-info';
import { IPublicTypeTitleContent } from './title-content';

/**
 * 组件的meta配置
 */
export interface IPublicTypeComponentMetadata {
	/**
	 * 其他扩展协议
	 */
	[key: string]: any;

	/**
	 * 组件名
	 */
	componentName: string;

	/**
	 * unique id
	 */
	uri?: string;

	/**
	 * title or description
	 */
	title?: IPublicTypeTitleContent;

	/**
	 * svg icon for component
	 */
	icon?: IPublicTypeIconType;

	/**
	 * 组件标签
	 */
	tags?: string[];

	/**
	 * 组件描述
	 */
	description?: string;

	/**
	 * 组件文档链接
	 */
	docUrl?: string;

	/**
	 * 组件快照
	 */
	screenshot?: string;

	/**
	 * 组件研发模式
	 */
	devMode?: 'proCode' | 'microCode';

	/**
	 * npm 源引入完整描述对象
	 */
	npm?: IPublicTypeNpmInfo;
}

import { IPublicModelSettingField } from '../model';
import { IPublicTypeCustomView } from './custom-view';
import { IPublicTypeTitleContent } from './title-content';

export interface IPublicTypeRegisteredSetter {
	/**
	 * setter 组件
	 */
	component: IPublicTypeCustomView;

	/**
	 * setter 组件的默认属性
	 */
	defaultProps?: object;

	/**
	 * setter 的标题
	 */
	title?: IPublicTypeTitleContent;

	/**
	 * setter 的条件函数，返回 true 时才会显示
	 */
	condition?: (field: IPublicModelSettingField) => boolean;

	/**
	 * setter 的初始值，可以是具体值或返回值的函数
	 */
	initialValue?: any | ((field: IPublicModelSettingField) => any);

	/**
	 * 是否推荐使用此 setter
	 */
	recommend?: boolean;

	/**
	 * 标识是否为动态 setter，默认为 true
	 */
	isDynamic?: boolean;
}

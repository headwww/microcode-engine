import { IPublicModelSettingField } from '../model';
import { IPublicTypeCompositeValue } from './composite-value';
import { IPublicTypeCustomView } from './custom-view';
import { IPublicTypeDynamicProps } from './dynamic-props';
import { IPublicTypeTitleContent } from './title-content';

export interface IPublicTypeSetterConfig {
	/**
	 * 配置设置器用哪一个 setter
	 */
	componentName: string | IPublicTypeCustomView;

	/**
	 * 传递给 setter 的属性
	 */
	props?: Record<string, unknown> | IPublicTypeDynamicProps;

	/**
	 * @deprecated
	 */
	children?: any;

	/**
	 * 是否必填？
	 *
	 * ArraySetter 里有个快捷预览，可以在不打开面板的情况下直接编辑
	 */
	isRequired?: boolean;

	/**
	 * Setter 的初始值
	 *
	 *  initialValue 可能要和 defaultValue 二选一
	 */
	initialValue?: any | ((target: IPublicModelSettingField) => any);

	defaultValue?: any;

	/**
	 * 给 MixedSetter 时切换 Setter 展示用的
	 */
	title?: IPublicTypeTitleContent;

	/**
	 * 给 MixedSetter 用于判断优先选中哪个
	 */
	condition?: (target: IPublicModelSettingField) => boolean;

	/**
	 * 给 MixedSetter，切换值时声明类型
	 *
	 *  物料协议推进
	 */
	valueType?: IPublicTypeCompositeValue[];

	// 标识是否为动态 setter，默认为 true
	isDynamic?: boolean;
}

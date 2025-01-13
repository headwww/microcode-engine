import { IPublicEnumPropValueChangedType } from '../enum';

/**
 * 设置值的选项接口
 */
export interface IPublicTypeSetValueOptions {
	/**
	 * 是否禁用变更器
	 */
	disableMutator?: boolean;

	/**
	 * 值变更的类型
	 */
	type?: IPublicEnumPropValueChangedType;

	/**
	 * 是否来自设置热值
	 */
	fromSetHotValue?: boolean;
}

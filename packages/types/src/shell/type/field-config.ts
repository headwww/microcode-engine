import { IPublicTypeDynamicSetter } from './dynamic-setter';
import { IPublicTypeFieldExtraProps } from './field-extra-props';
import { IPublicTypeSetterType } from './setter-type';
import { IPublicTypeTitleContent } from './title-content';

export interface IPublicTypeFieldConfig extends IPublicTypeFieldExtraProps {
	/**
	 * 面板配置隶属于单个 field 还是分组
	 */
	type?: 'field' | 'group';

	/**
	 * 该设置字段的名称,用于快速编辑器中
	 */
	name?: string | number;

	/**
	 * 字段标题
	 */
	title?: IPublicTypeTitleContent;

	/**
	 * 单个属性的 setter 配置
	 *
	 * 当 type = 'field' 时包含的字段内容
	 */
	setter?: IPublicTypeSetterType | IPublicTypeDynamicSetter;

	/**
	 * 当 type = 'group' 时包含的设置项
	 */
	items?: IPublicTypeFieldConfig[];

	/**
	 * 字段的额外属性
	 * 其他配置属性（不做流通要求）
	 */
	extraProps?: IPublicTypeFieldExtraProps;
}

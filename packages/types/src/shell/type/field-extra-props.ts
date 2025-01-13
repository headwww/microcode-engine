import { IPublicModelSettingField } from '../model';
import { IPublicTypeLiveTextEditingConfig } from './metadata';

export interface IPublicTypeFieldExtraProps {
	/**
	 * 是否必填参数
	 */
	isRequired?: boolean;

	/**
	 * setter 使用的目标属性的默认值
	 */
	defaultValue?: any;

	/**
	 * 获取字段值
	 */
	getValue?: (target: IPublicModelSettingField, fieldValue: any) => any;

	/**
	 * 设置字段值
	 */
	setValue?: (target: IPublicModelSettingField, value: any) => void;

	/**
	 * 字段的条件显示，如果未设置则始终为 true
	 * @default undefined
	 */
	condition?: (target: IPublicModelSettingField) => boolean;

	/**
	 * 配置当前 prop 是否忽略默认值处理逻辑，如果返回值是 true 引擎不会处理默认值
	 * @returns boolean
	 */
	ignoreDefaultValue?: (target: IPublicModelSettingField) => boolean;

	/**
	 * 当某些内容改变时自动运行
	 */
	autorun?: (target: IPublicModelSettingField) => void;

	/**
	 * 显示手风琴时默认折叠
	 */
	defaultCollapsed?: boolean;

	/**
	 * 重要字段
	 */
	important?: boolean;

	/**
	 * 内部使用
	 */
	forceInline?: number;

	/**
	 * 是否支持变量配置
	 */
	supportVariable?: boolean;

	/**
	 * 兼容视图显示
	 */
	display?: 'accordion' | 'inline' | 'block' | 'plain' | 'popup' | 'entry';

	liveTextEditing?: Omit<IPublicTypeLiveTextEditingConfig, 'propTarget'>;

	/**
	 * onChange 事件
	 */
	onChange?: (value: any, field: IPublicModelSettingField) => void;
}

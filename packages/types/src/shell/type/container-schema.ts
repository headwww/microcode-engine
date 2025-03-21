import { InterpretDataSource as DataSource } from '@arvin-shu/microcode-datasource-types';
import {
	IPublicTypeJSExpression,
	IPublicTypeJSFunction,
	IPublicTypeCompositeObject,
	IPublicTypeCompositeValue,
	IPublicTypeNodeSchema,
} from '.';

/**
 * 容器结构描述
 */
export interface IPublicTypeContainerSchema extends IPublicTypeNodeSchema {
	/**
	 * 'Block' | 'Page' | 'Component';
	 */
	componentName: string;

	/**
	 * 文件名称
	 */
	fileName: string;

	/**
	 * 待文档定义
	 */
	meta?: Record<string, unknown>;

	/**
	 * 容器初始数据
	 */
	state?: {
		[key: string]: IPublicTypeCompositeValue;
	};

	/**
	 * 自定义方法设置
	 */
	methods?: {
		[key: string]: IPublicTypeJSExpression | IPublicTypeJSFunction;
	};

	/**
	 * 生命周期对象
	 */
	lifeCycles?: {
		[key: string]: IPublicTypeJSExpression | IPublicTypeJSFunction;
	};

	/**
	 * 样式文件
	 */
	css?: string;

	/**
	 * 异步数据源配置
	 */
	dataSource?: DataSource;

	/**
	 * 低代码业务组件默认属性
	 */
	defaultProps?: IPublicTypeCompositeObject;
}

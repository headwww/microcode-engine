import { IPublicTypeCompositeValue } from './composite-value';
import { IPublicTypeNodeData } from './node-data';

/**
 * 变量表达式
 *
 * 表达式内通过 this 对象获取上下文
 */
export interface IPublicTypeJSExpression {
	type: 'JSExpression';

	/**
	 * 表达式字符串
	 */
	value: string;
}

/**
 * 事件函数类型
 *
 */
export interface IPublicTypeJSFunction {
	type: 'JSFunction';

	/**
	 * 函数定义，或直接函数表达式
	 */
	value: string;

	/**
	 * 额外扩展属性，如 extType、events
	 *
	 */
	[key: string]: any;
}

/**
 * Slot 函数类型
 *
 * 通常用于描述组件的某一个属性为 VNode  的场景。
 */
export interface IPublicTypeJSSlot {
	/**
	 * type
	 */
	type: 'JSSlot';

	title?: string;
	id?: string;
	name?: string;

	/**
	 * 组件的某一个属性为 VNode 时，函数的入参
	 *
	 */
	params?: string[];

	/**
	 * 具体的值。
	 */
	value?: IPublicTypeNodeData[] | IPublicTypeNodeData;
}

/**
 * JSON 基本类型
 */
export type IPublicTypeJSONValue =
	| boolean
	| string
	| number
	| null
	| undefined
	| IPublicTypeJSONArray
	| IPublicTypeJSONObject;
export type IPublicTypeJSONArray = IPublicTypeJSONValue[];
export interface IPublicTypeJSONObject {
	[key: string]: IPublicTypeJSONValue;
}

export type IPublicTypeCompositeArray = IPublicTypeCompositeValue[];

export interface IPublicTypeCompositeObject<T = IPublicTypeCompositeValue> {
	[key: string]: IPublicTypeCompositeValue | T;
}

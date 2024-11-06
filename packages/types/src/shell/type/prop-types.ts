/* eslint-disable max-len */
import { IPublicTypePropConfig } from '.';

/**
 * IPublicTypePropType 是一个联合类型，包含基础类型、必需类型和复杂类型。
 * 它是用于描述组件属性类型的主要类型。
 */
export type IPublicTypePropType =
	| IPublicTypeBasicType
	| IPublicTypeRequiredType
	| IPublicTypeComplexType;

/**
 * IPublicTypeBasicType 定义了基本的数据类型。
 * 可以用这些类型来指定属性为基础类型之一。
 */
export type IPublicTypeBasicType =
	| 'array'
	| 'bool'
	| 'func'
	| 'number'
	| 'object'
	| 'string'
	| 'node'
	| 'element'
	| 'any';

/**
 * IPublicTypeComplexType 是所有复杂类型的联合类型。
 * 包括更复杂的数据结构如枚举类型、组合类型、数组类型等。
 */
export type IPublicTypeComplexType =
	| IPublicTypeOneOf
	| IPublicTypeOneOfType
	| IPublicTypeArrayOf
	| IPublicTypeObjectOf
	| IPublicTypeShape
	| IPublicTypeExact
	| IPublicTypeInstanceOf;

/**
 * IPublicTypeRequiredType 接口表示一个带有必需性检查的基础类型。
 * 可以通过 `isRequired` 属性指定该类型是否为必填。
 */
export interface IPublicTypeRequiredType {
	type: IPublicTypeBasicType;
	isRequired?: boolean;
}

/**
 * IPublicTypeOneOf 接口表示该属性的值必须是 `value` 数组中的某一项。
 * 用于定义一组选项中的一种，类似于枚举。
 */
export interface IPublicTypeOneOf {
	type: 'oneOf';
	value: string[];
	isRequired?: boolean;
}

/**
 * IPublicTypeOneOfType 接口表示该属性的类型必须是 `value` 数组中的某一类型。
 * 用于类型的组合，比如可以是 'string' 或 'number'。
 */
export interface IPublicTypeOneOfType {
	type: 'oneOfType';
	value: IPublicTypePropType[];
	isRequired?: boolean;
}

/**
 * IPublicTypeArrayOf 接口表示该属性是一个数组，数组内的每一项都为指定的类型。
 * 例如：一个字符串数组 `arrayOf: 'string'`。
 */
export interface IPublicTypeArrayOf {
	type: 'arrayOf';
	value: IPublicTypePropType;
	isRequired?: boolean;
}

/**
 * IPublicTypeObjectOf 接口表示该属性是一个对象，对象的每个属性值均为指定类型。
 * 例如：一个键值对的对象，所有值为 'number' 类型。
 */
export interface IPublicTypeObjectOf {
	type: 'objectOf';
	value: IPublicTypePropType;
	isRequired?: boolean;
}

/**
 * IPublicTypeShape 接口表示该属性是一个对象，且对象的每个属性都由 `value` 数组定义。
 * 用于描述对象的结构，每个子属性都可以有特定的类型。
 */
export interface IPublicTypeShape {
	type: 'shape';
	value: IPublicTypePropConfig[];
	isRequired?: boolean;
}

/**
 * IPublicTypeExact 接口表示该属性是一个精确的对象结构。
 * 其内容与 `shape` 类似，但该对象不允许有多余的属性。
 */
export interface IPublicTypeExact {
	type: 'exact';
	value: IPublicTypePropConfig[];
	isRequired?: boolean;
}

/**
 * IPublicTypeInstanceOf 接口表示该属性的值必须是特定类的实例。
 * 例如：一个 `Date` 实例。
 */
export interface IPublicTypeInstanceOf {
	type: 'instanceOf';
	value: IPublicTypePropConfig;
	isRequired?: boolean;
}

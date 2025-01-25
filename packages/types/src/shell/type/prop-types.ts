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
 * IPublicTypeRequiredType 描述了一个属性的基本类型及其是否为必需。
 */
export interface IPublicTypeRequiredType {
	type: IPublicTypeBasicType;
	isRequired?: boolean;
}

/**
 * 枚举值类型
 */
export interface IPublicTypeOneOf {
	type: 'oneOf';
	value: string[];
	isRequired?: boolean;
}

/**
 * 指定类型中的一种，支持递归描述
 */
export interface IPublicTypeOneOfType {
	type: 'oneOfType';
	value: IPublicTypePropType[];
	isRequired?: boolean;
}

/**
 * 指定统一成员值类型的数组类型
 */
export interface IPublicTypeArrayOf {
	type: 'arrayOf';
	value: IPublicTypePropType;
	isRequired?: boolean;
}

/**
 * 指定统一对象属性值类型的对象类型
 */
export interface IPublicTypeObjectOf {
	type: 'objectOf';
	value: IPublicTypePropType;
	isRequired?: boolean;
}

/**
 * 指定对象的部分属性名和值类型的对象类型
 */
export interface IPublicTypeShape {
	type: 'shape';
	value: IPublicTypePropConfig[];
	isRequired?: boolean;
}

/**
 * 严格指定对象全部属性名和值类型的对象类型
 * 示例：
 * {
 *   type: 'exact',
 *   value: [
 *     {
 *       name: 'name',
 *       propType: 'string'
 *     },
 *     {
 *       name: 'quantity',
 *       propType: 'number'
 *     }
 *   ]
 * }
 */
export interface IPublicTypeExact {
	type: 'exact';
	value: IPublicTypePropConfig[];
	isRequired?: boolean;
}

/**
 * 用于指定一个属性的类型为某个特定的类实例。
 * 这可以用于确保传入的属性是某个特定类的实例。
 * 示例：
 * {
 *   type: 'instanceOf',
 *   value: SomeClass,
 *   isRequired: true
 * }
 */
export interface IPublicTypeInstanceOf {
	type: 'instanceOf';
	value: IPublicTypePropConfig;
	isRequired?: boolean;
}

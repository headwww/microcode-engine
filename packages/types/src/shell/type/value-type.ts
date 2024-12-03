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

	/**
	 * 模拟值
	 */
	mock?: any;
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
 *  {
 *    type: 'JSSlot',
 *    title: '测试 slot',
 *    name: 'testSlot',
 *    params: { a: 1 },
 *    value: [{ componentName: 'Button' }],
 *  }
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
	 * 示例:
	 * ```vue
	 * <!-- 在 Vue 中使用具名插槽 -->
	 * <MyComponent>
	 *   <template #default="{ item, index }">  <!-- 这里的 item 和 index 就是 params -->
	 *     <div>{{ item.name }} - {{ index }}</div>
	 *   </template>
	 * </MyComponent>
	 * ```
	 *
	 * 对应的类型定义:
	 * ```ts
	 * params: ['item', 'index'] // 定义插槽函数可以接收的参数
	 * ```
	 */
	params?: string[];

	/**
	 * 具体的值组件信息。
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

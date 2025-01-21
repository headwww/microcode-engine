/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-07 10:25:50
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-01-20 14:56:23
 * @FilePath: /microcode-engine/packages/types/src/shell/type/container-schema.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
		// @todo 生命周期对象建议改为闭合集合
		[key: string]: IPublicTypeJSExpression | IPublicTypeJSFunction;
	};

	/**
	 * 样式文件
	 */
	css?: string;

	/**
	 * 低代码业务组件默认属性
	 */
	defaultProps?: IPublicTypeCompositeObject;
}

import { IPublicTypeCompositeValue } from '../type';
import { IPublicModelNode } from './node';
import { IPublicModelProp } from './prop';

export interface IBaseModelProps<Prop> {
	/**
	 * id
	 */
	get id(): string;

	/**
	 * 返回当前 props 的路径
	 */
	get path(): string[];

	/**
	 * 返回所属的 node 实例
	 */
	get node(): IPublicModelNode | null;

	/**
	 * 获取指定 path 的属性模型实例
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 */
	getProp(path: string): Prop | null;

	/**
	 * 获取指定 path 的属性模型实例值
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 */
	getPropValue(path: string): any;

	/**
	 * 获取指定 path 的属性模型实例，
	 *  注：导出时，不同于普通属性，该属性并不挂载在 props 之下，而是与 props 同级
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 */
	getExtraProp(path: string): Prop | null;

	/**
	 * 获取指定 path 的属性模型实例值
	 *  注：导出时，不同于普通属性，该属性并不挂载在 props 之下，而是与 props 同级
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 */
	getExtraPropValue(path: string): any;

	/**
	 * 设置指定 path 的属性模型实例值
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 * @param value 值
	 */
	setPropValue(path: string, value: IPublicTypeCompositeValue): void;

	/**
	 * 设置指定 path 的属性模型实例值
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 * @param value 值
	 */
	setExtraPropValue(path: string, value: IPublicTypeCompositeValue): void;

	/**
	 * 当前 props 是否包含某 prop
	 * @param key
	 * @since v1.1.0
	 */
	has(key: string): boolean;

	/**
	 * 添加一个 prop
	 * @param value
	 * @param key
	 * @since v1.1.0
	 */
	add(value: IPublicTypeCompositeValue, key?: string | number | undefined): any;
}

export interface IPublicModelProps extends IBaseModelProps<IPublicModelProp> {}

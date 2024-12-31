import {
	IPublicModelNode,
	IPublicModelProp,
	IPublicModelProps,
	IPublicTypeCompositeValue,
} from '@arvin-shu/microcode-types';
import {
	getConvertedExtraKey,
	IProps as InnerProps,
} from '@arvin-shu/microcode-designer';
import { propsSymbol } from '../symbols';
import { Prop as ShellProp } from './prop';

/**
 * 属性组类,实现IPublicModelProps接口
 */
export class Props implements IPublicModelProps {
	/**
	 * 内部属性组实例
	 */
	private readonly [propsSymbol]: InnerProps;

	/**
	 * 构造函数
	 * @param props 内部属性组实例
	 */
	constructor(props: InnerProps) {
		this[propsSymbol] = props;
	}

	/**
	 * 创建属性组实例
	 * @param props 内部属性组实例
	 * @returns 属性组实例或null
	 */
	static create(
		props: InnerProps | undefined | null
	): IPublicModelProps | null {
		if (!props) {
			return null;
		}
		return new Props(props);
	}

	/**
	 * 获取属性组ID
	 */
	get id(): string {
		return this[propsSymbol].id;
	}

	/**
	 * 获取属性组路径
	 */
	get path(): string[] {
		return this[propsSymbol].path;
	}

	/**
	 * 获取所属节点
	 */
	get node(): IPublicModelNode | null {
		throw new Error('Method not implemented.');
	}

	/**
	 * 获取指定路径的属性实例
	 * @param path 属性路径
	 * @returns 属性实例或null
	 */
	getProp(path: string): IPublicModelProp<IPublicModelNode> | null {
		return ShellProp.create(this[propsSymbol].getProp(path));
	}

	/**
	 * 获取指定路径的属性值
	 * @param path 属性路径
	 * @returns 属性值
	 */
	getPropValue(path: string) {
		return this.getProp(path)?.getValue();
	}

	/**
	 * 获取指定路径的额外属性实例
	 * @param path 属性路径
	 * @returns 属性实例或null
	 */
	getExtraProp(path: string): IPublicModelProp<IPublicModelNode> | null {
		return ShellProp.create(
			this[propsSymbol].getProp(getConvertedExtraKey(path))
		);
	}

	/**
	 * 获取指定路径的额外属性值
	 * @param path 属性路径
	 * @returns 属性值
	 */
	getExtraPropValue(path: string) {
		return this.getExtraProp(path)?.getValue();
	}

	/**
	 * 设置指定路径的属性值
	 * @param path 属性路径
	 * @param value 属性值
	 */
	setPropValue(path: string, value: IPublicTypeCompositeValue): void {
		return this.getProp(path)?.setValue(value);
	}

	/**
	 * 设置指定路径的额外属性值
	 * @param path 属性路径
	 * @param value 属性值
	 */
	setExtraPropValue(path: string, value: IPublicTypeCompositeValue): void {
		return this.getExtraProp(path)?.setValue(value);
	}

	/**
	 * 判断是否包含指定key的属性
	 * @param key 属性key
	 * @returns 是否包含
	 */
	has(key: string): boolean {
		return this[propsSymbol].has(key);
	}

	/**
	 * 添加属性
	 * @param value 属性值
	 * @param key 属性key
	 * @returns 添加的属性
	 */
	add(value: IPublicTypeCompositeValue, key?: string | number | undefined) {
		return this[propsSymbol].add(value, key);
	}
}

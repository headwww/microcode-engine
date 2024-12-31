import {
	IPublicEnumTransformStage,
	IPublicModelNode,
	IPublicModelProp,
	IPublicTypeCompositeValue,
} from '@arvin-shu/microcode-types';
import { Ref } from 'vue';
import { IProp as InnerProp } from '@arvin-shu/microcode-designer';
import { propSymbol } from '../symbols';
import { Node as ShellNode } from './node';

/**
 * 属性类,实现IPublicModelProp接口
 */
export class Prop implements IPublicModelProp {
	/**
	 * 内部属性实例
	 */
	private readonly [propSymbol]: InnerProp;

	/**
	 * 构造函数
	 * @param prop 内部属性实例
	 */
	constructor(prop: InnerProp) {
		this[propSymbol] = prop;
	}

	/**
	 * 创建属性实例
	 * @param prop 内部属性实例
	 * @returns 属性实例或null
	 */
	static create(prop: InnerProp | undefined | null): IPublicModelProp | null {
		if (!prop) {
			return null;
		}
		return new Prop(prop);
	}

	/**
	 * 获取属性ID
	 */
	get id(): string {
		return this[propSymbol].id;
	}

	/**
	 * 获取属性key
	 */
	get key(): Ref<string | number | undefined, string | number | undefined> {
		return this[propSymbol].key;
	}

	/**
	 * 获取属性路径
	 */
	get path(): string[] {
		return this[propSymbol].path;
	}

	/**
	 * 返回所属的节点实例
	 */
	get node(): IPublicModelNode | null {
		return ShellNode.create(this[propSymbol].getNode());
	}

	/**
	 * return the slot node (only if the current prop represents a slot)
	 */
	get slotNode(): IPublicModelNode | null {
		return ShellNode.create(this[propSymbol].slotNode);
	}

	/**
	 * 是否为属性实例
	 */
	get isProp(): boolean {
		return true;
	}

	/**
	 * 设置属性值
	 * @param val 属性值
	 */
	setValue(val: IPublicTypeCompositeValue): void {
		this[propSymbol].setValue(val);
	}

	/**
	 * 获取属性值
	 */
	getValue() {
		return this[propSymbol].getValue();
	}

	/**
	 * 移除属性
	 */
	remove(): void {
		this[propSymbol].remove();
	}

	/**
	 * 导出属性schema
	 * @param stage 转换阶段
	 */
	exportSchema(stage: IPublicEnumTransformStage): IPublicTypeCompositeValue {
		return this[propSymbol].export(stage);
	}
}

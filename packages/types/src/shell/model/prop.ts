import { IPublicModelNode } from './node';
import { IPublicTypeCompositeValue } from '../type';
import { IPublicEnumTransformStage } from '../enum';

export interface IPublicModelProp<Node = IPublicModelNode> {
	/**
	 * id
	 */
	get id(): string;

	/**
	 * key 值
	 */
	get key(): string | number | undefined;

	/**
	 * 返回当前 prop 的路径
	 */
	get path(): string[];

	/**
	 * 返回所属的节点实例
	 */
	get node(): Node | null;

	/**
	 * 当本 prop 代表一个 Slot 时，返回对应的 slotNode
	 */
	get slotNode(): Node | undefined | null;

	/**
	 * 是否是 Prop , 固定返回 true
	 */
	get isProp(): boolean;

	/**
	 * 设置值
	 */
	setValue(val: IPublicTypeCompositeValue): void;

	/**
	 * 获取值
	 */
	getValue(): any;

	/**
	 * 移除值
	 */
	remove(): void;

	/**
	 * 导出值
	 */
	exportSchema(stage: IPublicEnumTransformStage): IPublicTypeCompositeValue;
}

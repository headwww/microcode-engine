import { IPublicModelNode } from '..';

/**
 * 节点变化选项
 */
export interface IPublicTypeOnChangeOptions<Node = IPublicModelNode> {
	/**
	 * 变化类型
	 */
	type: string;
	/**
	 * 父节点的实例也就是变化的节点
	 */
	node: Node;
}

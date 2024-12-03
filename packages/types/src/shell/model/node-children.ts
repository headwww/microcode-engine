import { IPublicModelNode } from './node';

export interface IPublicModelNodeChildren<Node = IPublicModelNode> {
	/**
	 * 插入一个节点
	 *
	 * @param node 待插入节点
	 * @param at 插入下标
	 * @returns
	 */
	insert(node: Node, at?: number | null): void;
}

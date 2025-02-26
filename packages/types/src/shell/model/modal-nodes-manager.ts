import { IPublicModelNode } from '.';

export interface IPublicModelModalNodesManager<Node = IPublicModelNode> {
	/**
	 * 设置模态节点，触发内部事件
	 */
	setNodes(): void;

	/**
	 * 获取模态节点（们）
	 */
	getModalNodes(): Node[];

	/**
	 * 获取当前可见的模态节点
	 */
	getVisibleModalNode(): Node | null;

	/**
	 * 隐藏模态节点（们）
	 */
	hideModalNodes(): void;

	/**
	 * 设置指定节点为可见态
	 * @param node Node
	 */
	setVisible(node: Node): void;

	/**
	 * 设置指定节点为不可见态
	 * @param node Node
	 */
	setInvisible(node: Node): void;
}

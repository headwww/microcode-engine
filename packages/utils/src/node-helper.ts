import { IPublicModelNode } from '@arvin-shu/microcode-types';

/**
 * 获取最近的满足条件的父节点
 * @param Node 节点类型,继承自IPublicModelNode
 * @returns 返回最近的满足条件的父节点,如果没有找到返回undefined
 */
export const getClosestNode = <
	Node extends IPublicModelNode = IPublicModelNode,
>(
	node: Node,
	until: (n: Node) => boolean
): Node | undefined => {
	if (!node) {
		return undefined;
	}
	if (until(node)) {
		return node;
	}
	// @ts-ignore
	return getClosestNode(node.parent, until);
};

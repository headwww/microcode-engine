/**
 * 编辑器事件
 */
export enum EDITOR_EVENT {
	// 节点子节点变化
	NODE_CHILDREN_CHANGE = 'node.children.change',
	// 节点显示状态变化
	NODE_VISIBLE_CHANGE = 'node.visible.change',
}

export type NodeRemoveOptions = {
	suppressRemoveEvent?: boolean;
};

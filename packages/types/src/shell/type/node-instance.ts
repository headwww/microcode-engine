import { IPublicTypeComponentInstance, IPublicModelNode } from '..';

export interface IPublicTypeNodeInstance<
	T = IPublicTypeComponentInstance,
	Node = IPublicModelNode,
> {
	// document id
	docId: string;
	// 节点 id
	nodeId: string;
	// 组件实例dom
	instance: T;
	// 节点
	node?: Node | null;
}

import {
	IBaseModelNode,
	IPublicTypeComponentSchema,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypePageSchema,
	IPublicTypeSlotSchema,
} from '@arvin/microcode-types';
import { IDocumentModel } from '../document-model';

export interface IBaseNode<
	Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema,
> extends Omit<IBaseModelNode<IDocumentModel>, 'importSchema'> {
	getId(): string;
	import(data: Schema, checkId?: boolean): void;
}

export class Node<Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema>
	implements IBaseNode
{
	/**
	 * 节点 id
	 */
	readonly id: string;

	constructor(
		readonly document: IDocumentModel,
		nodeSchema: Schema
	) {
		const { id } = nodeSchema;
		this.id = document.nextId(id);
	}

	getId() {
		return this.id;
	}

	import(data: IPublicTypeNodeSchema, checkId?: boolean): void {
		console.log(data, checkId);
	}
}

export type ISlotNode = IBaseNode<IPublicTypeSlotSchema>;
export type IPageNode = IBaseNode<IPublicTypePageSchema>;
export type IComponentNode = IBaseNode<IPublicTypeComponentSchema>;
export type IRootNode = IPageNode | IComponentNode;
export type INode = IPageNode | ISlotNode | IComponentNode | IRootNode;

/**
 * 插入单个节点
 *
 * @param container 容器节点
 * @param node 要插入的节点
 * @param index 插入位置
 * @param copy 是否复制节点
 */
export function insertChild(
	container: INode,
	thing: INode | IPublicTypeNodeData,
	index?: number | null,
	copy?: boolean
): INode | null {
	container.document?.createNode(thing);
	console.log(container, thing, index, copy);
	return null;
}

/**
 * 插入node
 *
 * @param container  容器节点（INode类型）
 * @param nodes 当前插入的节点
 * @param at 插入的位置
 * @param copy 可选参数，是否复制节点
 */
export function insertChildren(
	container: INode,
	nodes: INode[] | IPublicTypeNodeData[] | IPublicTypeNodeData[],
	at?: number | null,
	copy?: boolean
) {
	let index = at;
	let node: any;
	const results: INode[] = [];
	while (node === nodes.pop()) {
		node = insertChild(container, node, index, copy);
		results.push(node);
		index = node.index;
	}
	return results;
}

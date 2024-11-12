import {
	IPublicModelDocumentModel,
	IPublicTypeRootSchema,
} from '@arvin/microcode-types';
import { isDomText, isJSExpression, uniqueId } from '@arvin/microcode-utils';
import { IProject } from '../project';
import { INode, Node } from './node';

/**
 * 获取数据类型的工具类型
 * @template T - 输入类型参数
 * @template NodeType - 节点类型参数
 * @returns 如果 T 是 undefined,则:
 *          - 如果 NodeType 有 schema 属性,返回 schema 的类型
 *          - 否则返回 any
 *          如果 T 不是 undefined,则返回 T 本身
 */
export type GetDataType<T, NodeType> = T extends undefined
	? NodeType extends {
			schema: infer R;
		}
		? R
		: any
	: T;

export interface IDocumentModel
	extends Omit<IPublicModelDocumentModel<INode>, ''> {
	nextId(possibleId: string | undefined): string;
	open(): IDocumentModel;
	remove(): void;
}

export class DocumentModel implements IDocumentModel {
	/**
	 * 文档编号
	 */
	id: string = uniqueId('doc');

	readonly project: IProject;

	constructor(project: IProject, schema?: IPublicTypeRootSchema) {
		this.project = project;
		schema;
	}

	/**
	 * 生成node唯一id
	 *
	 * @param possibleId
	 * @returns
	 */
	nextId(possibleId: string | undefined): string {
		let id = possibleId;
		while (!id) {
			id = `node_`;
		}
		return id;
	}

	createNode<T = INode>(data: GetDataType<undefined, T>): T {
		let schema: any;
		if (isDomText(data) || isJSExpression(data)) {
			schema = {
				componentName: 'Leaf',
				children: data,
			};
		} else {
			schema = data;
		}
		// @ts-ignore
		const node: INode = new Node(this, schema);

		return node as any;
	}

	open(): DocumentModel {
		return this;
	}

	remove(): void {}
}

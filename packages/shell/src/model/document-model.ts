import {
	IPublicModelDocumentModel,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import { IDocumentModel as InnerDocumentModel } from '@arvin-shu/microcode-designer';
import { Node as ShellNode } from './node';
import { documentSymbol } from '../symbols';

const shellDocSymbol = Symbol('shellDocSymbol');

export class DocumentModel implements IPublicModelDocumentModel {
	private readonly [documentSymbol]: InnerDocumentModel;

	constructor(document: InnerDocumentModel) {
		this[documentSymbol] = document;
	}

	static create(
		document: InnerDocumentModel | undefined | null
	): IPublicModelDocumentModel | null {
		if (!document) {
			return null;
		}
		// @ts-ignore 直接返回已挂载的 shell doc 实例
		if (document[shellDocSymbol]) {
			return (document as any)[shellDocSymbol];
		}
		const shellDoc = new DocumentModel(document);
		// @ts-ignore 直接返回已挂载的 shell doc 实例
		document[shellDocSymbol] = shellDoc;
		return shellDoc;
	}

	/**
	 * 创建一个节点
	 * @param data
	 * @returns
	 */
	createNode<IPublicModelNode>(
		data: IPublicTypeNodeSchema
	): IPublicModelNode | null {
		return ShellNode.create(this[documentSymbol].createNode(data)) as any;
	}

	getComponentsMap(extraComps?: string[]): any {
		return this[documentSymbol].getComponentsMap(extraComps);
	}

	get id(): string {
		throw new Error('Method not implemented.');
	}

	set id(id: string) {
		throw new Error('Method not implemented.');
	}
}

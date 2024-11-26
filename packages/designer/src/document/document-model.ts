import {
	IPublicModelDocumentModel,
	IPublicTypeComponentsMap,
	IPublicTypeRootSchema,
} from '@arvin-shu/microcode-types';
import {
	isDomText,
	isJSExpression,
	uniqueId,
} from '@arvin-shu/microcode-utils';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { IProject } from '../project';
import { INode, IRootNode, Node } from './node';
import { ISimulatorHost } from '../simulator';
import { IDesigner } from '../designer';

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
	readonly designer: IDesigner;
	get simulator(): ISimulatorHost | null;
	nextId(possibleId: string | undefined): string;
	open(): IDocumentModel;
	remove(): void;
}

export class DocumentModel implements IDocumentModel {
	/**
	 * 根节点 类型有：Page/Component/Block
	 */
	rootNode: IRootNode | null;

	/**
	 * 文档编号
	 */
	id: string = uniqueId('doc');

	readonly project: IProject;

	readonly designer: IDesigner;

	private emitter: IEventBus;

	// 是否初始化完成
	private inited = false;

	private _blank?: boolean;

	/**
	 * 模拟器
	 */
	get simulator(): ISimulatorHost | null {
		return this.project.simulator;
	}

	constructor(project: IProject, schema?: IPublicTypeRootSchema) {
		this.project = project;
		this.designer = project.designer;
		this.emitter = createModuleEventBus('DocumentModel');
		// 是否是空白文档
		if (!schema) {
			this._blank = true;
		}

		this.id = project.getSchema()?.id || this.id;

		// 创建根节点
		this.rootNode = this.createNode(
			schema || {
				componentName: 'Page',
				id: 'root',
				fileName: '',
			}
		);

		// 初始化完成
		this.inited = true;
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
		const node: INode = new Node(this, schema);

		return node as any;
	}

	open(): DocumentModel {
		return this;
	}

	remove(): void {}

	getComponentsMap(extraComps?: string[]): any {
		const componentsMap: IPublicTypeComponentsMap = [];
		extraComps;
		return componentsMap;
	}
}

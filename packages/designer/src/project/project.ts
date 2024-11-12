import {
	IBaseApiProject,
	IPublicTypeProjectSchema,
	IPublicTypeRootSchema,
} from '@arvin/microcode-types';
import { createModuleEventBus, IEventBus } from '@arvin/microcode-editor-core';
import { shallowReactive } from 'vue';
import { DocumentModel, IDocumentModel } from '../document';
import { IDesigner } from '../designer';

export interface IProject extends Omit<IBaseApiProject, 'importSchema'> {
	load(schema?: IPublicTypeProjectSchema, autoOpen?: boolean | string): void;

	createDocument(data?: IPublicTypeRootSchema): IDocumentModel;
}

export class Project implements IProject {
	private emitter: IEventBus = createModuleEventBus('Project');

	readonly documents = shallowReactive<IDocumentModel[]>([]);

	// 辅助属性，用于快速查找文档
	private documentMap = new Map<string, IDocumentModel>();

	private data: IPublicTypeProjectSchema = {
		version: '1.0.0',
		componentsMap: [],
		componentsTree: [],
		i18n: {},
	};

	constructor(
		readonly designer: IDesigner,
		schema?: IPublicTypeProjectSchema,
		readonly viewName = 'global'
	) {
		this.load(schema);
	}

	/**
	 * 加载传入的页面搭载协议
	 *
	 * @param schema 描述的是低代码搭建平台产物（应用、页面、区块、组件）的 schema 结构
	 * @param autoOpen 自动打开文档
	 */
	load(schema?: IPublicTypeProjectSchema, autoOpen?: boolean | string): void {
		this.unload();
		this.data = {
			version: '1.0.0',
			componentsMap: [],
			componentsTree: [],
			i18n: {},
			...schema,
		};

		if (autoOpen) {
			if (autoOpen === true) {
				// auto open first document or open a blank page
				// this.open(this.data.componentsTree[0]);
				const documentInstances = this.data.componentsTree.map((data) =>
					this.createDocument(data)
				);
				documentInstances[0].open();
			} else {
				// 当 autoOpen 是字符串时,表示要打开的文件名,调用 open 方法打开指定文件
				// this.open(autoOpen);
			}
		}
	}

	/**
	 * 卸载所有文档
	 * 从后往前遍历文档列表,依次移除每个文档
	 */
	unload() {
		if (this.documents.length < 1) {
			return;
		}
		for (let i = this.documents.length - 1; i >= 0; i--) {
			this.documents[i].remove();
		}
	}

	createDocument(data?: IPublicTypeRootSchema): IDocumentModel {
		const doc = new DocumentModel(this, data || this.data.componentsTree[0]);
		this.documents.push(doc);
		this.documentMap.set(doc.id, doc);
		return doc;
	}
}

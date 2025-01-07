import {
	IBaseApiProject,
	IPublicEnumTransformStage,
	IPublicTypeComponentsMap,
	IPublicTypeProjectSchema,
	IPublicTypeRootSchema,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { computed, ref, shallowReactive } from 'vue';
import {
	isMicrocodeComponentType,
	isProCodeComponentType,
} from '@arvin-shu/microcode-utils';
import { DocumentModel, IDocumentModel, isDocumentModel } from '../document';
import { IDesigner } from '../designer';
import { ISimulatorHost } from '../simulator';

export interface IProject
	extends Omit<
		IBaseApiProject<IDocumentModel>,
		| 'simulatorHost'
		| 'importSchema'
		| 'exportSchema'
		| 'openDocument'
		| 'getDocumentById'
		| 'getCurrentDocument'
		| 'addPropsTransducer'
		| 'onRemoveDocument'
		| 'onChangeDocument'
		| 'onSimulatorHostReady'
		| 'onSimulatorRendererReady'
		| 'setI18n'
		| 'setConfig'
		| 'currentDocument'
		| 'selection'
		| 'documents'
		| 'createDocument'
		| 'getDocumentByFileName'
	> {
	get designer(): IDesigner;

	get simulator(): ISimulatorHost | null;

	get currentDocument(): IDocumentModel | null | undefined;

	get documents(): IDocumentModel[];

	get i18n(): {
		[local: string]: {
			[key: string]: any;
		};
	};

	mountSimulator(simulator: ISimulatorHost): void;

	open(
		doc?: string | IDocumentModel | IPublicTypeRootSchema
	): IDocumentModel | null;

	getDocumentByFileName(fileName: string): IDocumentModel | null;

	createDocument(data?: IPublicTypeRootSchema): IDocumentModel;

	load(schema?: IPublicTypeProjectSchema, autoOpen?: boolean | string): void;

	getSchema(stage?: IPublicEnumTransformStage): IPublicTypeProjectSchema;

	getDocument(id: string): IDocumentModel | null;

	onCurrentDocumentChange(fn: (doc: IDocumentModel) => void): () => void;

	onSimulatorReady(fn: (args: any) => void): () => void;

	onRendererReady(fn: () => void): () => void;

	/**
	 * 分字段设置储存数据，不记录操作记录
	 */
	set<T extends keyof IPublicTypeProjectSchema>(
		key: T,
		value: IPublicTypeProjectSchema[T]
	): void;
	set(key: string, value: unknown): void;

	/**
	 * 分字段获取储存数据
	 */
	get<T extends keyof IPublicTypeProjectSchema>(
		key: T
	): IPublicTypeProjectSchema[T];
	get<T>(key: string): T;
	get(key: string): unknown;

	checkExclusive(activeDoc: DocumentModel): void;

	setRendererReady(renderer: any): void;
}

export class Project implements IProject {
	private emitter: IEventBus = createModuleEventBus('Project');

	readonly documents = shallowReactive<IDocumentModel[]>([]);

	private data: IPublicTypeProjectSchema = {
		version: '1.0.0',
		componentsMap: [],
		componentsTree: [],
		i18n: {},
	};

	private readonly computedCurrentDocument = computed(() =>
		this.documents.find((doc) => doc.active)
	);

	private _simulator?: ISimulatorHost;

	private isRendererReady: boolean = false;

	/**
	 * 模拟器
	 */
	get simulator(): ISimulatorHost | null {
		return this._simulator || null;
	}

	get currentDocument() {
		return this.computedCurrentDocument.value;
	}

	private _config = ref({});

	private readonly computedConfig = computed(() => this._config.value);

	get config() {
		return this.computedConfig.value;
	}

	set config(value: any) {
		this._config.value = value;
	}

	private _i18n = ref({});

	private readonly computedI18n = computed(() => this._i18n.value);

	get i18n() {
		return this.computedI18n.value;
	}

	set i18n(value: any) {
		this._i18n.value = value || {};
	}

	// 辅助属性，用于快速查找文档
	private documentsMap = new Map<string, IDocumentModel>();

	constructor(
		readonly designer: IDesigner,
		schema?: IPublicTypeProjectSchema,
		readonly viewName = 'global'
	) {
		this.load(schema);
	}

	/**
	 * 获取组件映射表
	 */
	private getComponentsMap(): IPublicTypeComponentsMap {
		return this.documents.reduce<IPublicTypeComponentsMap>(
			(
				componentsMap: IPublicTypeComponentsMap,
				curDoc: IDocumentModel
			): IPublicTypeComponentsMap => {
				const curComponentsMap = curDoc.getComponentsMap();
				if (Array.isArray(curComponentsMap)) {
					curComponentsMap.forEach((item) => {
						const found = componentsMap.find((eItem) => {
							if (
								isProCodeComponentType(eItem) &&
								isProCodeComponentType(item) &&
								eItem.package === item.package &&
								eItem.componentName === item.componentName
							) {
								return true;
							}
							if (
								isMicrocodeComponentType(eItem) &&
								eItem.componentName === item.componentName
							) {
								return true;
							}
							return false;
						});
						if (found) return;
						componentsMap.push(item);
					});
				}
				return componentsMap;
			},
			[] as IPublicTypeComponentsMap
		);
	}

	/**
	 * 获取项目整体 schema
	 */
	getSchema(
		stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save
	): IPublicTypeProjectSchema {
		return {
			...this.data,
			componentsMap: this.getComponentsMap(),
			componentsTree: this.documents
				.filter((doc) => !doc.isBlank())
				.map((doc) => doc.export(stage) || ({} as IPublicTypeRootSchema)),
			i18n: this.i18n,
		};
	}

	/**
	 * 替换当前 document 的 schema，并触发渲染器的 render
	 * @param schema
	 */
	setSchema(schema?: IPublicTypeProjectSchema) {
		// FIXME: 这里的行为和 getSchema 并不对等，感觉不太对
		const doc = this.documents.find((doc) => doc.active);
		doc && schema?.componentsTree[0] && doc.import(schema?.componentsTree[0]);
		this.simulator?.rerender();
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

		this.config = schema?.config || this.config;
		this.i18n = schema?.i18n || this.i18n;

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
				this.open(autoOpen);
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

	removeDocument(doc: IDocumentModel) {
		const index = this.documents.indexOf(doc);
		if (index < 0) {
			return;
		}
		this.documents.splice(index, 1);
		this.documentsMap.delete(doc.id);
	}

	/**
	 * 分字段设置储存数据，不记录操作记录
	 */
	set<T extends keyof IPublicTypeProjectSchema>(
		key: T,
		value: IPublicTypeProjectSchema[T]
	): void;

	// eslint-disable-next-line no-dupe-class-members
	set(key: string, value: unknown): void;

	// eslint-disable-next-line no-dupe-class-members
	set(key: string, value: unknown): void {
		if (key === 'config') {
			this.config = value;
		}
		if (key === 'i18n') {
			this.i18n = value;
		}
		Object.assign(this.data, { [key]: value });
	}

	/**
	 * 分字段设置储存数据
	 */
	get<T extends keyof IPublicTypeRootSchema>(key: T): IPublicTypeRootSchema[T];

	get<T>(key: string): T;

	get(key: string): unknown;

	get(key: string): any {
		if (key === 'config') {
			return this.config;
		}
		if (key === 'i18n') {
			return this.i18n;
		}
		return Reflect.get(this.data, key);
	}

	getDocument(id: string): IDocumentModel | null {
		return this.documents.find((doc) => doc.id === id) || null;
	}

	getDocumentByFileName(fileName: string): IDocumentModel | null {
		return this.documents.find((doc) => doc.fileName === fileName) || null;
	}

	createDocument(data?: IPublicTypeRootSchema): IDocumentModel {
		const doc = new DocumentModel(this, data || this.data.componentsTree[0]);
		this.documents.push(doc as any);
		this.documentsMap.set(doc.id, doc as any);
		return doc as any;
	}

	open(
		doc?: string | IDocumentModel | IPublicTypeRootSchema
	): IDocumentModel | null {
		if (!doc) {
			const got = this.documents.find((item) => item.isBlank());
			if (got) {
				return got.open();
			}
			doc = this.createDocument();
			return doc.open();
		}
		if (typeof doc === 'string' || typeof doc === 'number') {
			const got = this.documents.find(
				(item) =>
					item.fileName === String(doc) || String(item.id) === String(doc)
			);
			if (got) {
				return got.open();
			}

			const data = this.data.componentsTree.find(
				(data) => data.fileName === String(doc)
			);
			if (data) {
				doc = this.createDocument(data);
				return doc.open();
			}

			return null;
		}
		if (isDocumentModel(doc)) {
			return doc.open();
		}

		doc = this.createDocument(doc);
		return doc.open();
	}

	checkExclusive(activeDoc: DocumentModel): void {
		this.documents.forEach((doc) => {
			if (doc !== (activeDoc as any)) {
				doc.suspense();
			}
		});
		this.emitter.emit('current-document.change', activeDoc);
	}

	closeOthers(opened: DocumentModel) {
		this.documents.forEach((doc) => {
			if (doc !== (opened as any)) {
				doc.close();
			}
		});
	}

	mountSimulator(simulator: ISimulatorHost) {
		// TODO: 多设备 simulator 支持
		this._simulator = simulator;
		this.emitter.emit('microcode_engine_simulator_ready', simulator);
	}

	setRendererReady(renderer: any) {
		this.isRendererReady = true;
		this.emitter.emit('microcode_engine_renderer_ready', renderer);
	}

	onSimulatorReady(fn: (args: any) => void): () => void {
		if (this._simulator) {
			fn(this._simulator);
			return () => {};
		}
		return () => {
			this.emitter.removeListener('microcode_engine_simulator_ready', fn);
		};
	}

	onRendererReady(fn: () => void): () => void {
		if (this.isRendererReady) {
			fn();
		}
		this.emitter.on('microcode_engine_renderer_ready', fn);
		return () => {
			this.emitter.removeListener('microcode_engine_renderer_ready', fn);
		};
	}

	onCurrentDocumentChange(fn: (doc: IDocumentModel) => void): () => void {
		this.emitter.on('current-document.change', fn);
		return () => {
			this.emitter.removeListener('current-document.change', fn);
		};
	}
}

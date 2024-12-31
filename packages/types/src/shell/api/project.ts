import { IPublicEnumTransformStage } from '../enum';
import { IPublicModelDocumentModel } from '../model';
import {
	IPublicTypeDisposable,
	IPublicTypeProjectSchema,
	IPublicTypePropsTransducer,
	IPublicTypeRootSchema,
} from '../type';
import { IPublicApiSimulatorHost } from './simulator-host';

export interface IBaseApiProject<DocumentModel> {
	/**
	 * 获取当前的 document
	 * get current document
	 */
	get currentDocument(): DocumentModel | null;

	/**
	 * 获取当前 project 下所有 documents
	 * @returns
	 */
	get documents(): DocumentModel[];

	/**
	 * 获取模拟器的 host
	 */
	get simulatorHost(): IPublicApiSimulatorHost | null;

	/**
	 * 打开一个 document
	 */
	openDocument(
		doc?: string | IPublicTypeRootSchema | undefined
	): DocumentModel | null;

	/**
	 * 创建一个 document
	 */
	createDocument(data?: IPublicTypeRootSchema): DocumentModel | null;

	/**
	 * 删除一个 document
	 */
	removeDocument(doc: DocumentModel): void;

	/**
	 * 根据 fileName 获取 document
	 */
	getDocumentByFileName(fileName: string): DocumentModel | null;

	/**
	 * 根据 id 获取 document
	 */
	getDocumentById(id: string): DocumentModel | null;

	/**
	 * 导出 project
	 */
	exportSchema(stage: IPublicEnumTransformStage): IPublicTypeProjectSchema;

	/**
	 * 导入 project schema
	 */
	importSchema(schema?: IPublicTypeProjectSchema): void;

	/**
	 * 获取当前的 document
	 */
	getCurrentDocument(): DocumentModel | null;

	/**
	 * 增加一个属性的管道处理函数
	 */
	addPropsTransducer(
		transducer: IPublicTypePropsTransducer,
		stage: IPublicEnumTransformStage
	): void;

	/**
	 * 绑定删除文档事件
	 */
	onRemoveDocument(fn: (data: { id: string }) => void): IPublicTypeDisposable;

	/**
	 * 当前 project 内的 document 变更事件
	 */
	onChangeDocument(fn: (doc: DocumentModel) => void): IPublicTypeDisposable;

	/**
	 * 当前 project 的模拟器 ready 事件
	 */
	onSimulatorHostReady(
		fn: (host: IPublicApiSimulatorHost) => void
	): IPublicTypeDisposable;

	/**
	 * 当前 project 的渲染器 ready 事件
	 */
	onSimulatorRendererReady(fn: () => void): IPublicTypeDisposable;

	/**
	 * 设置多语言语料
	 *
	 */
	setI18n(value: object): void;

	// TODO setConfig
}
export interface IPublicApiProject
	extends IBaseApiProject<IPublicModelDocumentModel> {}

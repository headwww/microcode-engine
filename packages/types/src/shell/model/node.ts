import { IPublicTypeNodeSchema } from '../type';
import { IPublicModelDocumentModel } from './document-model';

export interface IBaseModelNode<Document = IPublicModelDocumentModel> {
	/**
	 * 节点id
	 */
	id: string;

	/**
	 * 获取节点所属的文档模型对象
	 */
	get document(): Document | null;

	/**
	 * 导入节点数据
	 * @param data
	 */
	importSchema(data: IPublicTypeNodeSchema): void;
}

export interface IPublicModelNode
	extends IBaseModelNode<IPublicModelDocumentModel> {}

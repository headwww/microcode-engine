import { IPublicTypeNodeSchema } from '../type';
import { IPublicModelDocumentModel } from './document-model';
import { IPublicModelNodeChildren } from './node-children';

export interface IBaseModelNode<
	Document = IPublicModelDocumentModel,
	NodeChildren = IPublicModelNodeChildren,
> {
	/**
	 * 节点id
	 */
	id: string;

	/**
	 * 获取节点所属的文档模型对象
	 */
	get document(): Document | null;

	/**
	 * 获取当前节点的孩子节点模型
	 */
	get children(): NodeChildren | null;

	/**
	 * 导入节点数据
	 * @param data
	 */
	importSchema(data: IPublicTypeNodeSchema): void;
}

export interface IPublicModelNode
	extends IBaseModelNode<IPublicModelDocumentModel> {}

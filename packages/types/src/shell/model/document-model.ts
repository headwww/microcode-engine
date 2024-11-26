import { IPublicTypeNodeSchema } from '../type';
import { IPublicModelNode } from './node';

export interface IPublicModelDocumentModel<Node = IPublicModelNode> {
	/**
	 * 创建节点
	 *
	 * @param data 节点数据
	 */
	createNode<T = Node>(data: IPublicTypeNodeSchema): T | null;

	/**
	 * 获取组件映射表
	 *
	 * @param extraComps 额外添加的组件
	 */
	getComponentsMap(extraComps?: string[]): any;
}

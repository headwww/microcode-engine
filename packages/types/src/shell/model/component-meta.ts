import { IPublicTypeNodeData } from '../type';
import { IPublicModelNode } from './node';

/**
 * 组件元数据
 */
export interface IPublicModelComponentMeta<Node = IPublicModelNode> {
	/**
	 * 组件名称
	 */
	get componentName(): string;

	/**
	 * 检测当前对应节点是否可被放置在父节点中
	 *
	 * @param my 当前节点
	 * @param parent 父节点
	 */
	checkNestingUp(my: Node | IPublicTypeNodeData, params: any): boolean;
}

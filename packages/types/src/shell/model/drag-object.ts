import { IPublicEnumDragObjectType } from '../enum';
import { IPublicTypeNodeSchema } from '../type';
import { IPublicModelNode } from './node';

/**
 * 定义拖拽对象的数据模型
 */
export class IPublicModelDragObject {
	type: IPublicEnumDragObjectType.Node | IPublicEnumDragObjectType.NodeData;

	data: IPublicTypeNodeSchema | IPublicTypeNodeSchema[] | null;

	nodes: (IPublicModelNode | null)[] | null;
}

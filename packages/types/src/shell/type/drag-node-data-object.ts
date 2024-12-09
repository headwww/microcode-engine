import { IPublicEnumDragObjectType } from '../enum';
import { IPublicModelNode } from '../model';
import { IPublicTypeNodeSchema } from './node-schema';

export interface IPublicTypeDragNodeDataObject {
	type: IPublicEnumDragObjectType.NodeData;
	data: IPublicTypeNodeSchema | IPublicTypeNodeSchema[];
	// TODO 临时添加的防治类型报错的
	nodes: (IPublicModelNode | null)[] | null;
	thumbnail?: string;
	description?: string;
	[extra: string]: any;
}

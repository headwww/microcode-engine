import { IPublicEnumDragObjectType } from '../enum';
import { IPublicTypeNodeSchema } from './node-schema';

export interface IPublicTypeDragNodeDataObject {
	type: IPublicEnumDragObjectType.NodeData;
	data: IPublicTypeNodeSchema | IPublicTypeNodeSchema[];
}

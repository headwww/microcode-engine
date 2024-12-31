import { IPublicTypeDragAnyObject } from './drag-any-object';
import { IPublicTypeDragNodeDataObject } from './drag-node-data-object';
import { IPublicTypeDragNodeObject } from './drag-node-object';

export type IPublicTypeDragObject =
	| IPublicTypeDragNodeObject
	| IPublicTypeDragNodeDataObject
	| IPublicTypeDragAnyObject;

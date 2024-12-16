import { IPublicModelLocateEvent, IPublicModelNode } from '../model';

export type IPublicTypeLocationDetail = { [key: string]: any; type: string };

export interface IPublicTypeLocationData<Node = IPublicModelNode> {
	target: Node;
	detail: IPublicTypeLocationDetail;
	source: string;
	event: IPublicModelLocateEvent;
}

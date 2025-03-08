import { IPublicTypeActiveTarget } from '../type';
import { IPublicModelNode } from './node';

export interface IPublicModelActiveTracker {
	target: IPublicTypeActiveTarget | null;

	onChange(fn: (target: IPublicTypeActiveTarget) => void): () => void;

	track(node: IPublicModelNode): void;
}

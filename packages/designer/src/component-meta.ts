import {
	IPublicModelComponentMeta,
	IPublicTypeComponentMetadata,
} from '@arvin/microcode-types';
import { INode } from './document';
import { Designer } from './designer';

export interface IComponentMeta extends IPublicModelComponentMeta<INode> {
	setMetadata(metadata: IPublicTypeComponentMetadata): void;
}

export class ComponentMeta implements IComponentMeta {
	private _componentName: string;

	get componentName(): string {
		return this._componentName;
	}

	constructor(
		readonly designer: Designer,
		data: IPublicTypeComponentMetadata
	) {
		this.parseMeta(data);
	}

	setMetadata(metadata: IPublicTypeComponentMetadata): void {
		this.parseMeta(metadata);
	}

	private parseMeta(data: IPublicTypeComponentMetadata) {
		const { componentName } = data;
		this._componentName = componentName;
	}

	checkNestingUp(): boolean {
		return true;
	}
}

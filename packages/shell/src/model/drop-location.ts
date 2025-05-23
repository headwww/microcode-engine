import { IDropLocation as InnerDropLocation } from '@arvin-shu/microcode-designer';
import {
	IPublicModelDropLocation,
	IPublicTypeLocationDetail,
	IPublicModelLocateEvent,
} from '@arvin-shu/microcode-types';
import { dropLocationSymbol } from '../symbols';
import { Node as ShellNode } from './node';

export class DropLocation implements IPublicModelDropLocation {
	private readonly [dropLocationSymbol]: InnerDropLocation;

	constructor(dropLocation: InnerDropLocation) {
		this[dropLocationSymbol] = dropLocation;
	}

	static create(
		dropLocation: InnerDropLocation | null
	): IPublicModelDropLocation | null {
		if (!dropLocation) {
			return null;
		}
		return new DropLocation(dropLocation);
	}

	get target() {
		return ShellNode.create(this[dropLocationSymbol].target);
	}

	get detail(): IPublicTypeLocationDetail {
		return this[dropLocationSymbol].detail;
	}

	get event(): IPublicModelLocateEvent {
		return this[dropLocationSymbol].event;
	}

	clone(event: IPublicModelLocateEvent): IPublicModelDropLocation {
		return new DropLocation(this[dropLocationSymbol].clone(event));
	}
}

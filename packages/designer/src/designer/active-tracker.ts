import {
	IPublicModelActiveTracker,
	IPublicTypeActiveTarget,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { isNode } from '@arvin-shu/microcode-utils';
import { INode } from '../document';

export interface IActiveTracker
	extends Omit<IPublicModelActiveTracker, 'track' | 'onChange' | 'target'> {
	_target: ActiveTarget | INode;

	track(originalTarget: ActiveTarget | INode): void;

	onChange(fn: (target: ActiveTarget) => void): () => void;
}

export interface ActiveTarget extends Omit<IPublicTypeActiveTarget, 'node'> {
	node: INode;
}

export class ActiveTracker implements IActiveTracker {
	_target: ActiveTarget | INode;

	private emitter: IEventBus = createModuleEventBus('ActiveTracker');

	track(originalTarget: ActiveTarget | INode) {
		let target = originalTarget;
		if (isNode(originalTarget)) {
			target = { node: originalTarget as INode };
		}
		this._target = target;
		this.emitter.emit('change', target);
	}

	get currentNode() {
		return (this._target as ActiveTarget)?.node;
	}

	get detail() {
		return (this._target as ActiveTarget)?.detail;
	}

	get instance() {
		return (this._target as ActiveTarget)?.instance;
	}

	onChange(fn: (target: ActiveTarget) => void): () => void {
		this.emitter.addListener('change', fn);
		return () => {
			this.emitter.removeListener('change', fn);
		};
	}
}

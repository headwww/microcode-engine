import EventEmitter from 'eventemitter2';
import { EventBus, IEventBus } from './event-bus';

export interface IEditor {
	eventBus: IEventBus;
}
export class Editor extends EventEmitter implements IEditor {
	eventBus: IEventBus;

	constructor() {
		super();
		this.eventBus = new EventBus(this);
	}
}

export const commonEvent = new EventBus(new EventEmitter());

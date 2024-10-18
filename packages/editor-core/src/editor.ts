import EventEmitter from 'eventemitter2';
import { EventBus } from './event-bus';

export interface IEditor {}
export class Editor implements IEditor {}

export const commonEvent = new EventBus(new EventEmitter());

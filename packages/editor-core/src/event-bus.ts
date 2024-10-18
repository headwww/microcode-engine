import { IPublicApiEvent, IPublicTypeDisposable } from '@arvin/microcode-types';
import { Logger } from '@arvin/microcode-utils';
import EventEmitter from 'eventemitter2';

const logger = new Logger({ level: 'warn', bizName: 'event-bus' });
const moduleLogger = new Logger({ level: 'warn', bizName: 'module-event-bus' });

export interface IEventBus extends IPublicApiEvent {
	removeListener(
		event: string | symbol,
		listener: (...args: any[]) => void
	): any;
	addListener(event: string | symbol, listener: (...args: any[]) => void): any;
	setMaxListeners(n: number): any;
	removeAllListeners(event?: string | symbol): any;
}

export class EventBus implements IEventBus {
	private readonly eventEmitter: EventEmitter;

	private readonly name?: string;

	constructor(emitter: EventEmitter, name?: string) {
		this.eventEmitter = emitter;
		this.name = name;
	}

	/**
	 * 监听事件
	 * @param event 事件名称
	 * @param listener 事件回调
	 */
	on(event: string, listener: (...args: any[]) => void): IPublicTypeDisposable {
		this.eventEmitter.on(event, listener);
		this.getLogger().debug(`${this.getMsgPrefix('on')} ${event}`);
		return () => {
			this.off(event, listener);
		};
	}

	/**
	 * 监听事件，会在其他回调函数之前执行
	 * @param event 事件名称
	 * @param listener 事件回调
	 */
	prependListener(
		event: string,
		listener: (...args: any[]) => void
	): () => void {
		this.eventEmitter.prependListener(event, listener);
		this.getLogger().debug(`${this.getMsgPrefix('prependListener')} ${event}`);
		return () => {
			this.off(event, listener);
		};
	}

	/**
	 * 取消监听事件
	 * @param event 事件名称
	 * @param listener 事件回调
	 */
	off(event: string, listener: (...args: any[]) => void) {
		this.eventEmitter.off(event, listener);
		this.getLogger().debug(`${this.getMsgPrefix('off')} ${event}`);
	}

	/**
	 * 触发事件
	 * @param event 事件名称
	 * @param args 事件参数
	 * @returns
	 */
	emit(event: string, ...args: any[]) {
		this.eventEmitter.emit(event, ...args);
		this.getLogger().debug(
			`${this.getMsgPrefix('emit')} name: ${event}, args: `,
			...args
		);
	}

	removeListener(
		event: string | symbol,
		listener: (...args: any[]) => void
	): any {
		return this.eventEmitter.removeListener(event, listener);
	}

	addListener(event: string | symbol, listener: (...args: any[]) => void): any {
		return this.eventEmitter.addListener(event, listener);
	}

	setMaxListeners(n: number): any {
		return this.eventEmitter.setMaxListeners(n);
	}

	removeAllListeners(event?: string | symbol): any {
		return this.eventEmitter.removeAllListeners(event);
	}

	private getMsgPrefix(type: string): string {
		if (this.name && this.name.length > 0) {
			return `[${this.name}][event-${type}]`;
		}
		return `[*][event-${type}]`;
	}

	private getLogger(): Logger {
		if (this.name && this.name.length > 0) {
			return moduleLogger;
		}
		return logger;
	}
}

export const createModuleEventBus = (
	moduleName: string,
	maxListeners?: number
): IEventBus => {
	const emitter = new EventEmitter();
	if (maxListeners) {
		emitter.setMaxListeners(maxListeners);
	}
	return new EventBus(emitter, moduleName);
};

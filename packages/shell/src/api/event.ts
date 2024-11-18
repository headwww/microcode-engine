import { IEditor, IEventBus } from '@arvin-shu/microcode-editor-core';
import {
	IPublicApiEvent,
	IPublicTypeDisposable,
} from '@arvin-shu/microcode-types';
import { getLogger, isPluginEventName } from '@arvin-shu/microcode-utils';

const logger = getLogger({ level: 'warn', bizName: 'shell-event' });

type EventOptions = {
	prefix: string;
};

const eventBusSymbol = Symbol('eventBus');

/**
 * Event是EventBus外观类
 */
export class Event implements IPublicApiEvent {
	private readonly [eventBusSymbol]: IEventBus;

	private readonly options: EventOptions;

	constructor(
		eventBus: IEventBus,
		options: EventOptions,
		public workspaceMode = false
	) {
		this[eventBusSymbol] = eventBus;
		this.options = options;
		if (!this.options.prefix) {
			logger.warn('prefix is required while initializing Event');
		}
	}

	/**
	 * 监听事件
	 * @param event 事件名称
	 * @param listener 事件回调
	 */
	on(event: string, listener: (...args: any[]) => void): IPublicTypeDisposable {
		if (isPluginEventName(event)) {
			return this[eventBusSymbol].on(event, listener);
		}
		logger.warn(
			`fail to monitor on event ${event}, event should have a prefix like 'somePrefix:eventName'`
		);
		return () => {};
	}

	/**
	 * 监听事件，会在其他回调函数之前执行
	 * @param event 事件名称
	 * @param listener 事件回调
	 */
	prependListener(
		event: string,
		listener: (...args: any[]) => void
	): IPublicTypeDisposable {
		if (isPluginEventName(event)) {
			return this[eventBusSymbol].prependListener(event, listener);
		}
		logger.warn(
			`fail to prependListener event ${event}, event should have a prefix like 'somePrefix:eventName'`
		);
		return () => {};
	}

	/**
	 * 取消监听事件
	 * @param event 事件名称
	 * @param listener 事件回调
	 */
	off(event: string, listener: (...args: any[]) => void) {
		this[eventBusSymbol].off(event, listener);
	}

	/**
	 * 触发事件
	 * @param event 事件名称
	 * @param args 事件参数
	 * @returns
	 */
	emit(event: string, ...args: any[]) {
		if (!this.options.prefix) {
			logger.warn(
				'Event#emit has been forbidden while prefix is not specified'
			);
			return;
		}
		this[eventBusSymbol].emit(`${this.options.prefix}:${event}`, ...args);
	}

	/**
	 * DO NOT USE if u fully understand what this method does.
	 * @param event
	 * @param args
	 */
	__internalEmit__(event: string, ...args: unknown[]) {
		this[eventBusSymbol].emit(event, ...args);
	}
}

/**
 * 获取事件实例，在插件面板注册的时候处理editor的实例带的eventBus的
 * 不给用户直接使用this.skeleton.editor.eventBus,
 * 给用户使用的是Event外观类需要提供options配置的，这样面板组件之间通信更加规范
 *
 * @param editor 实例是editor提供的eventBus
 * @param options 事件配置
 * @returns 事件实例
 */
export function getEvent(editor: IEditor, options: any = { prefix: 'common' }) {
	return new Event(editor.eventBus, options);
}

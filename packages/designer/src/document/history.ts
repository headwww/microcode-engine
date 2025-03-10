import {
	IPublicModelHistory,
	IPublicTypeDisposable,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import { watch } from 'vue';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { Logger } from '@arvin-shu/microcode-utils';
import { IDocumentModel } from './document-model';

/**
 * 序列化接口定义,用于历史记录的序列化和反序列化
 * K - 输入数据类型,默认为 IPublicTypeNodeSchema
 * T - 序列化后的数据类型,默认为 string
 */
export interface Serialization<K = IPublicTypeNodeSchema, T = string> {
	serialize(data: K): T; // 序列化方法
	unserialize(data: T): K; // 反序列化方法
}

export interface IHistory extends IPublicModelHistory {
	onStateChange(func: () => any): IPublicTypeDisposable;
}
const logger = new Logger({ level: 'warn', bizName: 'history' });

export class History<T = IPublicTypeNodeSchema> implements IHistory {
	private session: Session; // 当前会话

	private records: Session[]; // 历史记录数组

	private point = 0; // 保存点位置

	private emitter: IEventBus = createModuleEventBus('History'); // 事件总线

	private asleep = false; // 是否处于休眠状态

	// 默认序列化实现
	private currentSerialization: Serialization<T, string> = {
		serialize(data: T): string {
			return JSON.stringify(data);
		},
		unserialize(data: string) {
			return JSON.parse(data);
		},
	};

	// 获取当前会话的数据
	get hotData() {
		return this.session.data;
	}

	// 会话超时时间,默认1秒
	private timeGap: number = 1000;

	constructor(
		dataFn: () => T | null,
		private redoer: (data: T) => void,
		private document?: IDocumentModel
	) {
		this.session = new Session(0, null, this.timeGap);
		this.records = [this.session];

		watch(
			dataFn,
			(data: any) => {
				if (this.asleep) return;
				const log = this.currentSerialization.serialize(data);
				// 数据未变化时不记录
				if (this.session.data === log) {
					return;
				}

				if (this.session.isActive()) {
					// 当前会话活跃,记录数据
					this.session.log(log);
				} else {
					// 当前会话已结束,创建新会话
					this.session.end();
					const lastState = this.getState();
					const cursor = this.session.cursor + 1;
					const session = new Session(cursor, log, this.timeGap);
					this.session = session;
					// 移除当前位置之后的记录,添加新会话
					this.records.splice(cursor, this.records.length - cursor, session);
					const currentState = this.getState();
					if (currentState !== lastState) {
						this.emitter.emit('statechange', currentState);
					}
				}
			},
			{
				immediate: true,
				deep: true,
			}
		);
	}

	/**
	 * 设置序列化实现
	 */
	setSerialization(serialization: Serialization<T, string>) {
		this.currentSerialization = serialization;
	}

	/**
	 * 检查当前是否处于保存点
	 */
	isSavePoint(): boolean {
		return this.point !== this.session.cursor;
	}

	/**
	 * 进入休眠状态
	 */
	private sleep() {
		this.asleep = true;
	}

	/**
	 * 唤醒
	 */
	private wakeup() {
		this.asleep = false;
	}

	/**
	 * 跳转到指定历史记录点
	 * @param originalCursor 目标位置
	 */
	go(originalCursor: number) {
		this.session.end();

		let cursor = originalCursor;
		cursor = +cursor;
		// 确保游标在有效范围内
		if (cursor < 0) {
			cursor = 0;
		} else if (cursor >= this.records.length) {
			cursor = this.records.length - 1;
		}

		const currentCursor = this.session.cursor;
		if (cursor === currentCursor) {
			return;
		}

		const session = this.records[cursor];
		const hotData = session.data;

		this.sleep();
		try {
			// 执行重做操作
			this.redoer(this.currentSerialization.unserialize(hotData));
			this.emitter.emit('cursor', hotData);
		} catch (e) /* istanbul ignore next */ {
			logger.error(e);
		}

		this.wakeup();
		this.session = session;

		this.emitter.emit('statechange', this.getState());
	}

	/**
	 * 回退一步
	 */
	back() {
		if (!this.session) {
			return;
		}
		const cursor = this.session.cursor - 1;
		this.go(cursor);
		const editor = this.document?.designer.editor;
		if (!editor) {
			return;
		}
		editor.eventBus.emit('history.back', cursor);
	}

	/**
	 * 前进一步
	 */
	forward() {
		if (!this.session) {
			return;
		}
		const cursor = this.session.cursor + 1;
		this.go(cursor);
		const editor = this.document?.designer.editor;
		if (!editor) {
			return;
		}
		editor.eventBus.emit('history.forward', cursor);
	}

	/**
	 * 设置保存点
	 */
	savePoint() {
		if (!this.session) {
			return;
		}
		this.session.end();
		this.point = this.session.cursor;
		this.emitter.emit('statechange', this.getState());
	}

	/**
	 * 获取当前状态
	 * 返回值是一个3位二进制数:
	 * 第1位(4) - 是否已修改
	 * 第2位(2) - 是否可重做
	 * 第3位(1) - 是否可撤销
	 * @returns 状态值(0-7)
	 */
	getState(): number {
		const { cursor } = this.session;
		let state = 7;
		// 检查是否可撤销
		if (cursor <= 0) {
			state -= 1;
		}
		// 检查是否可重做
		if (cursor >= this.records.length - 1) {
			state -= 2;
		}
		// 检查是否已修改
		if (this.point === cursor) {
			state -= 4;
		}
		return state;
	}

	/**
	 * 监听状态变更事件
	 * @param func 回调函数
	 */
	onChangeState(func: () => any): IPublicTypeDisposable {
		return this.onStateChange(func);
	}

	/**
	 * 监听状态变更事件
	 * @param func 回调函数
	 */
	onStateChange(func: () => any): IPublicTypeDisposable {
		this.emitter.on('statechange', func);
		return () => {
			this.emitter.removeListener('statechange', func);
		};
	}

	/**
	 * 监听游标位置变更事件
	 * @param func 回调函数
	 */
	onChangeCursor(func: () => any): IPublicTypeDisposable {
		return this.onCursor(func);
	}

	/**
	 * 监听游标变更事件
	 * @param func 回调函数
	 */
	onCursor(func: () => any): () => void {
		this.emitter.on('cursor', func);
		return () => {
			this.emitter.removeListener('cursor', func);
		};
	}

	/**
	 * 销毁历史记录
	 */
	destroy() {
		this.emitter.removeAllListeners();
		this.records = [];
	}

	/**
	 * 检查是否已修改
	 * @deprecated 请使用 isSavePoint 代替
	 */
	isModified() {
		return this.isSavePoint();
	}
}

export class Session {
	private _data: any;

	private activeTimer: any;

	get data() {
		return this._data;
	}

	constructor(
		readonly cursor: number,
		data: any,
		private timeGap: number = 1000
	) {
		this.setTimer();
		this.log(data);
	}

	log(data: any) {
		if (!this.isActive()) {
			return;
		}
		this._data = data;
		this.setTimer();
	}

	isActive() {
		return this.activeTimer != null;
	}

	end() {
		if (this.isActive()) {
			this.clearTimer();
		}
	}

	private setTimer() {
		this.clearTimer();
		this.activeTimer = setTimeout(() => this.end(), this.timeGap);
	}

	private clearTimer() {
		if (this.activeTimer) {
			clearTimeout(this.activeTimer);
		}
		this.activeTimer = null;
	}
}

import { IPublicTypeDisposable } from '../type';

export interface IPublicModelHistory {
	/**
	 * 历史记录跳转到指定位置
	 * @param cursor
	 */
	go(cursor: number): void;

	/**
	 * 历史记录后退
	 */
	back(): void;

	/**
	 * 历史记录前进
	 */
	forward(): void;

	/**
	 * 保存当前状态
	 */
	savePoint(): void;

	/**
	 * 当前是否是「保存点」，即是否有状态变更但未保存
	 */
	isSavePoint(): boolean;

	/**
	 * 获取 state，判断当前是否为「可回退」、「可前进」的状态
	 *
	 *  |    1     |     1    |    1     |
	 *  | -------- | -------- | -------- |
	 *  | modified | redoable | undoable |
	 * eg.
	 *  7 means : modified && redoable && undoable
	 *  5 means : modified && undoable
	 */
	getState(): number;

	/**
	 * 监听 state 变更事件
	 * @param func
	 */
	onChangeState(func: () => any): IPublicTypeDisposable;

	/**
	 * 监听历史记录游标位置变更事件
	 * @param func
	 */
	onChangeCursor(func: () => any): IPublicTypeDisposable;
}

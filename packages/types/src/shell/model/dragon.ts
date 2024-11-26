import { IPublicTypeDisposable, IPublicTypeDragNodeDataObject } from '../type';
import { IPublicModelDragObject } from './drag-object';
import { IPublicModelLocateEvent } from './locate-event';

export interface IPublicModelDragon<LocateEvent = IPublicModelLocateEvent> {
	/**
	 * 绑定 dragstart 事件
	 * bind a callback function which will be called on dragging start
	 * @param func
	 * @returns
	 */
	onDragstart(func: (e: LocateEvent) => any): IPublicTypeDisposable;

	/**
	 * 绑定 drag 事件
	 * bind a callback function which will be called on dragging
	 * @param func
	 * @returns
	 */
	onDrag(func: (e: LocateEvent) => any): IPublicTypeDisposable;

	/**
	 * 绑定 dragend 事件
	 * bind a callback function which will be called on dragging end
	 * @param func
	 * @returns
	 */
	onDragend(
		func: (o: { dragObject: IPublicModelDragObject; copy?: boolean }) => any
	): IPublicTypeDisposable;

	/**
	 * 设置拖拽监听的区域 shell，以及自定义拖拽转换函数 boost
	 *
	 * @param shell 拖拽监听的区域
	 * @param boost 拖拽转换函数
	 */
	from(
		shell: Element,
		boost: (e: MouseEvent) => IPublicTypeDragNodeDataObject | null
	): any;
}

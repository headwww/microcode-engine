import { IPublicTypeLocationDetail } from '../type';
import { IPublicModelLocateEvent } from './locate-event';
import { IPublicModelNode } from './node';

export interface IPublicModelDropLocation {
	/**
	 * 拖拽位置目标
	 */
	get target(): IPublicModelNode | null;

	/**
	 * 拖拽放置位置详情
	 */
	get detail(): IPublicTypeLocationDetail;

	/**
	 * 拖拽放置位置对应的事件
	 */
	get event(): IPublicModelLocateEvent;

	/**
	 * 获取一份当前对象的克隆
	 */
	clone(event: IPublicModelLocateEvent): IPublicModelDropLocation;
}

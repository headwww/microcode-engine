import { IPublicTypeComponentInstance, IPublicTypeNodeInstance } from '../type';
import { IPublicModelDropLocation } from './drop-location';
import { IPublicModelLocateEvent } from './locate-event';
import { IPublicModelNode } from './node';

export interface IPublicModelSensor<Node = IPublicModelNode> {
	/**
	 * 是否可响应，比如面板被隐藏，可设置该值 false
	 */
	readonly sensorAvailable: boolean;

	/**
	 * 给事件打补丁
	 */
	fixEvent(e: IPublicModelLocateEvent): IPublicModelLocateEvent;

	/**
	 * 是否进入敏感板区域
	 */
	isEnter(e: IPublicModelLocateEvent): boolean;

	/**
	 * 取消激活
	 */
	deactiveSensor(): void;

	/**
	 * 定位并激活
	 */
	locate(
		e: IPublicModelLocateEvent
	): IPublicModelDropLocation | undefined | null;

	/**
	 * 获取节点实例
	 */
	getNodeInstanceFromElement?: (
		e: Element | null
	) => IPublicTypeNodeInstance<IPublicTypeComponentInstance, Node> | null;
}

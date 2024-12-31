import {
	IPublicModelSensor,
	IPublicTypeComponentInstance,
	IPublicTypeNodeInstance,
	IPublicTypeScrollable,
} from '@arvin-shu/microcode-types';
import { Point } from './designer';
import { INode } from './document';
import { ScrollTarget } from './designer/scroller';

export type AutoFit = '100%';
// eslint-disable-next-line no-redeclare
export const AutoFit = '100%';

export interface DropContainer {
	container: INode;
	instance: IPublicTypeComponentInstance;
}

export interface ISimulatorHost<P = object> extends IPublicModelSensor {
	setProps(props: P): void;
	readonly viewport: IViewport;

	// 模拟器iframe的window
	readonly contentWindow?: Window;
	// 模拟器iframe的document
	readonly contentDocument?: Document;

	// TODO 没有设置类型
	readonly renderer?: any;

	setSuspense(suspensed: boolean): void;

	/**
	 * 根据节点获取节点的组件实例
	 */
	getComponentInstances(node: INode): IPublicTypeComponentInstance[] | null;

	computeRect(node: INode): DOMRect | null;

	findDOMNodes(
		instance: IPublicTypeComponentInstance,
		selector?: string
	): Array<Element | Text> | null;

	computeComponentInstanceRect(
		instance: IPublicTypeComponentInstance,
		selector?: string
	): DOMRect | null;

	getClosestNodeInstance(
		from: IPublicTypeComponentInstance,
		specId?: string
	): IPublicTypeNodeInstance | null;
}

export interface IScrollable extends IPublicTypeScrollable {}

export interface IViewport extends IScrollable {
	/**
	 * 视口大小
	 */
	width: number;
	height: number;

	/**
	 * 内容大小
	 */
	contentWidth: number | AutoFit;
	contentHeight: number | AutoFit;

	/**
	 * 内容缩放
	 */
	scale: number;

	/**
	 * 视口矩形维度
	 */
	readonly bounds: DOMRect;

	/**
	 * 内容矩形维度
	 */
	readonly contentBounds: DOMRect;

	/**
	 * 视口滚动对象
	 */
	readonly scrollTarget?: ScrollTarget;

	/**
	 * 是否滚动中
	 */
	readonly scrolling: boolean;

	/**
	 * 内容当前滚动 X
	 */
	readonly scrollX: number;

	/**
	 * 内容当前滚动 Y
	 */
	readonly scrollY: number;

	/**
	 * 全局坐标系转化为本地坐标系
	 */
	toLocalPoint(point: Point): Point;

	/**
	 * 本地坐标系转化为全局坐标系
	 */
	toGlobalPoint(point: Point): Point;
}

export function isSimulatorHost(obj: any): obj is ISimulatorHost {
	return obj && obj.isSimulator;
}

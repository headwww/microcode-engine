import { IPublicModelSensor } from '@arvin-shu/microcode-types';
import { Point } from './designer';

export type AutoFit = '100%';
// eslint-disable-next-line no-redeclare
export const AutoFit = '100%';

export interface ISimulatorHost<P = object> extends IPublicModelSensor {
	setProps(props: P): void;
	readonly viewport: IViewport;

	// 模拟器iframe的window
	readonly contentWindow?: Window;
	// 模拟器iframe的document
	readonly contentDocument?: Document;

	setSuspense(suspensed: boolean): void;
}

export interface IViewport {
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

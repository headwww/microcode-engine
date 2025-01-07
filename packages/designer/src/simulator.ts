import {
	IPublicModelSensor,
	IPublicTypeComponentInstance,
	IPublicTypeComponentMetadata,
	IPublicTypeNodeInstance,
	IPublicTypeNodeSchema,
	IPublicTypePackage,
	IPublicTypeScrollable,
} from '@arvin-shu/microcode-types';
import { Component } from 'vue';
import { IDesigner, ILocateEvent, Point } from './designer';
import { INode } from './document';
import { ScrollTarget } from './designer/scroller';
import { BuiltinSimulatorRenderer } from './builtin-simulator';
import { IProject } from './project';

export type AutoFit = '100%';
// eslint-disable-next-line no-redeclare
export const AutoFit = '100%';

export interface DropContainer {
	container: INode;
	instance: IPublicTypeComponentInstance;
}

export interface ISimulatorHost<P = object> extends IPublicModelSensor {
	readonly isSimulator: true;
	readonly viewport: IViewport;

	readonly contentWindow?: Window;
	readonly contentDocument?: Document;
	readonly renderer?: BuiltinSimulatorRenderer;

	readonly project: IProject;

	readonly designer: IDesigner;

	setProps(props: P): void;
	set(key: string, value: any): void;

	setSuspense(suspensed: boolean): void;

	/**
	 * 设置文字拖选
	 */
	setNativeSelection(enableFlag: boolean): void;

	/**
	 * 设置拖拽态
	 */
	setDraggingState(state: boolean): void;

	/**
	 * 设置拷贝态
	 */
	setCopyState(state: boolean): void;

	/**
	 * 清除所有态：拖拽态、拷贝态
	 */
	clearState(): void;

	/**
	 * 滚动视口到节点
	 */
	scrollToNode(node: INode, detail?: any): void;

	/**
	 * 描述组件
	 */
	generateComponentMetadata(
		componentName: string
	): IPublicTypeComponentMetadata;

	/**
	 * 根据组件信息获取组件类
	 */
	getComponent(componentName: string): Component | object | any;

	/**
	 * 根据节点获取节点的组件实例
	 */
	getComponentInstances(node: INode): IPublicTypeComponentInstance[] | null;

	/**
	 * 根据 schema 创建组件类
	 */
	createComponent(schema: IPublicTypeNodeSchema): Component | null;

	/**
	 * 根据节点获取节点的组件运行上下文
	 */
	getComponentContext(node: INode): object | null;

	getClosestNodeInstance(
		from: IPublicTypeComponentInstance,
		specId?: string
	): IPublicTypeNodeInstance | null;

	computeRect(node: INode): DOMRect | null;

	computeComponentInstanceRect(
		instance: IPublicTypeComponentInstance,
		selector?: string
	): DOMRect | null;

	findDOMNodes(
		instance: IPublicTypeComponentInstance,
		selector?: string
	): Array<Element | Text> | null;
	getDropContainer(e: ILocateEvent): DropContainer | null;

	postEvent(evtName: string, evtData: any): void;

	rerender(): void;
	/**
	 * 销毁
	 */
	purge(): void;

	setupComponents(library: IPublicTypePackage[]): Promise<void>;
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

export interface INodeSelector {
	node: INode;
	instance?: IPublicTypeComponentInstance;
}

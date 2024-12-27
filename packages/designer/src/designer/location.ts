import {
	IPublicTypeLocationData,
	IPublicTypeLocationDetail,
	IPublicTypeRect,
} from '@arvin-shu/microcode-types';
import { IDocumentModel, INode } from '../document';
import { ILocateEvent } from './dragon';

export interface Point {
	clientX: number;
	clientY: number;
}

export interface CanvasPoint {
	canvasX: number;
	canvasY: number;
}

export class DropLocation {
	readonly target: INode;

	readonly detail: IPublicTypeLocationDetail;

	readonly event: ILocateEvent;

	readonly source: string;

	get document(): IDocumentModel | null {
		return this.target.document;
	}

	constructor({
		target,
		detail,
		source,
		event,
	}: IPublicTypeLocationData<INode>) {
		this.target = target;
		this.detail = detail;
		this.source = source;
		this.event = event as any;
	}
}

export function getRectTarget(rect: IPublicTypeRect | null) {
	if (!rect || rect.computed) {
		return null;
	}
	const els = rect.elements;
	return els && els.length > 0 ? els[0]! : null;
}

function isText(elem: any): elem is Text {
	return elem.nodeType === Node.TEXT_NODE;
}

function isDocument(elem: any): elem is Document {
	return elem.nodeType === Node.DOCUMENT_NODE;
}

export function getWindow(elem: Element | Document): Window {
	return (isDocument(elem) ? elem : elem.ownerDocument!).defaultView!;
}

/**
 * 判断一个元素是否为内联元素
 * @param child 待检查的元素或文本节点
 * @param win 可选的window对象,用于获取计算样式
 * @returns 如果是内联元素返回true,否则返回false
 */
export function isChildInline(child: Element | Text, win?: Window) {
	// 如果是文本节点,直接返回true
	if (isText(child)) {
		return true;
	}
	// 获取元素的计算样式
	const style = (win || getWindow(child)).getComputedStyle(child);
	// 检查display是否为inline开头,或者float是否为left/right
	return (
		/^inline/.test(style.getPropertyValue('display')) ||
		/^(left|right)$/.test(style.getPropertyValue('float'))
	);
}

/**
 * 判断一个容器是否为行容器
 * @param container 待检查的容器元素或文本节点
 * @param win 可选的window对象,用于获取计算样式
 * @returns 如果是行容器返回true,否则返回false
 */
export function isRowContainer(container: Element | Text, win?: Window) {
	// 如果是文本节点,直接返回true
	if (isText(container)) {
		return true;
	}
	// 获取容器的计算样式
	const style = (win || getWindow(container)).getComputedStyle(container);
	const display = style.getPropertyValue('display');
	// 检查是否为flex布局
	if (/flex$/.test(display)) {
		const direction = style.getPropertyValue('flex-direction') || 'row';
		// 如果flex-direction为row或row-reverse,则为行容器
		if (direction === 'row' || direction === 'row-reverse') {
			return true;
		}
	}
	// 检查是否为grid布局,grid布局也视为行容器
	if (/grid$/.test(display)) {
		return true;
	}
	return false;
}

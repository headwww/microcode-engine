import { isObject } from '@arvin-shu/microcode-renderer-core';

/**
 * 判断节点是否为注释节点
 * @param el 待检查的节点
 * @returns 是否为注释节点
 */
export function isCommentNode(
	el: Element | Text | Comment | Node
): el is Comment {
	return el.nodeType === 8;
}

/**
 * 判断节点是否为文本节点
 * @param el 待检查的节点
 * @returns 是否为文本节点
 */
export function isTextNode(el: Element | Text | Comment | Node): el is Text {
	return el.nodeType === 3;
}

/**
 * 判断节点是否为DOM节点(元素节点或文本节点)
 * @param el 待检查的节点
 * @returns 是否为DOM节点
 */
export function isDomNode(el: unknown): el is Element | Text {
	return (
		isObject(el) &&
		'nodeType' in el &&
		(el.nodeType === Node.ELEMENT_NODE || el.nodeType === Node.TEXT_NODE)
	);
}

/**
 * 判断节点是否为空节点(注释节点或空文本节点)
 * @param el 待检查的节点
 * @returns 是否为空节点
 */
export function isEmptyNode(el: Element | Text | Comment | Node): boolean {
	return isCommentNode(el) || (isTextNode(el) && el.nodeValue === '');
}

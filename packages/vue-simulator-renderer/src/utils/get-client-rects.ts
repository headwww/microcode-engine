import { isElement } from '@arvin-shu/microcode-renderer-core';

// a range for test TextNode clientRect
const cycleRange = document.createRange();

export function getClientRects(node: Element | Text) {
	if (!node.parentNode) return [];

	if (isElement(node)) {
		return [node.getBoundingClientRect()];
	}

	cycleRange.selectNode(node);
	return Array.from(cycleRange.getClientRects());
}

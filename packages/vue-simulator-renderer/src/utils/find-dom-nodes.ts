import { ComponentPublicInstance } from 'vue';
import { isEmptyNode } from './check-node';

export function findDOMNodes(instance: ComponentPublicInstance) {
	const els: (Element | Text)[] = [];

	const el: Element | Text = instance.$el;

	if (isEmptyNode(el)) {
		// TODO 空节点的情况
	} else {
		els.push(el);
	}

	return els;
}

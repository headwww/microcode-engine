import { cloneVNode, Component, isVNode, VNode, h } from 'vue';
import { isString } from 'lodash-es';
import { isVueComponent } from './is-vue';

export function createContent(
	content: string | VNode | Component,
	props?: Record<string, unknown>
): VNode {
	if (isString(content)) {
		return h('span', content);
	}
	if (isVNode(content)) {
		return props ? cloneVNode(content, props) : content;
	}
	if (isVueComponent(content)) {
		return h(content, props);
	}
	return content;
}

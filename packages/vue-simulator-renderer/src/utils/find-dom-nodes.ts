import { isVNode, VNode } from 'vue';
import { isDomNode, isEmptyNode } from './check-node';
import { getClientRects } from './get-client-rects';
import { isVNodeHTMLElement } from './comp-node';

/**
 * 查找组件实例对应的DOM节点
 * @param instance 组件实例
 * @returns DOM节点数组
 */
export function findDOMNodes(instance: any) {
	const els: (Element | Text)[] = [];

	const el: Element | Text = instance.$el;

	if (isEmptyNode(el)) {
		const internalInstance = instance.$;
		// 添加前面的兄弟节点
		appendSiblingElement(
			els,
			internalInstance,
			el,
			(node) => node.previousSibling
		);
		// 添加子组件节点
		appendDescendantComponent(els, internalInstance);
		// 添加后面的兄弟节点
		appendSiblingElement(els, internalInstance, el, (node) => node.nextSibling);
	} else {
		els.push(el);
	}

	return els;
}

/**
 * 添加兄弟元素节点
 * @param target 目标数组
 * @param instance 组件实例
 * @param el 当前元素
 * @param next 获取下一个节点的函数
 */
function appendSiblingElement(
	target: (Element | Text)[],
	instance: any,
	el: Element | Text,
	next: (el: Node) => Node | null
) {
	let nextNode = next(el);
	while (nextNode) {
		if (isEmptyNode(nextNode)) {
			nextNode = next(nextNode);
			continue;
		}
		if (isVNodeHTMLElement(nextNode)) {
			const childInstance = nextNode.__vueParentComponent;
			if (isChildInstance(instance, childInstance)) {
				target.unshift(nextNode);
				nextNode = next(nextNode);
				continue;
			}
		}
		break;
	}
}

/**
 * 添加子组件节点
 * @param target 目标数组
 * @param instance 组件实例
 * @returns 是否成功添加节点
 */
function appendDescendantComponent(
	target: (Element | Text)[],
	instance: any
): boolean {
	const subNode = instance.subTree;
	const current = subNode.el as Element | Text;
	if (isValidElement(current)) {
		target.push(current);
		return true;
	}
	if (Array.isArray(subNode.children) && subNode.children.length > 0) {
		return appendDescendantChildren(
			target,
			subNode.children as VNode<Element | Text>[]
		);
	}
	if (subNode.component) {
		return appendDescendantComponent(target, subNode.component);
	}
	return false;
}

/**
 * 添加子节点
 * @param target 目标数组
 * @param children VNode子节点数组
 * @returns 是否成功添加节点
 */
function appendDescendantChildren(
	target: (Element | Text)[],
	children: VNode[]
): boolean {
	const validElements = children.map(({ el }) => el).filter(isValidElement);
	if (validElements.length > 0) {
		target.push(...validElements);
		return true;
	}
	return (
		children.length > 0 &&
		children.some((item) => {
			if (Array.isArray(item.children) && item.children.length > 0) {
				return appendDescendantChildren(
					target,
					item.children.filter((child): child is VNode<Element | Text> =>
						isVNode(child)
					)
				);
			}
			if (item.component) {
				return appendDescendantComponent(target, item.component);
			}
			return false;
		})
	);
}

/**
 * 判断是否为有效的DOM元素
 * @param el 待检查的元素
 * @returns 是否为有效的DOM元素
 */
function isValidElement(el: unknown): el is Element | Text {
	if (el && isDomNode(el) && !isEmptyNode(el)) {
		const rect = getClientRects(el);
		return rect.some((item) => item.width || item.height);
	}
	return false;
}

/**
 * 判断是否为子组件实例
 * @param target 目标组件实例
 * @param source 源组件实例
 * @returns 是否为子组件实例
 */
function isChildInstance(target: any, source: any | null): boolean {
	if (source == null) return false;
	if (target.uid > source.uid) return false;
	if (target.uid === source.uid) return true;
	return isChildInstance(target, source.parent);
}

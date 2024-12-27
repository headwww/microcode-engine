import type { ComponentInternalInstance } from 'vue';
import { IPublicTypeNodeInstance } from '@arvin-shu/microcode-types';
import type { ComponentRecord } from '../interface';
import {
	getCompRootData,
	isVNodeHTMLElement,
	createComponentRecord,
	isCompRootHTMLElement,
} from './comp-node';

/**
 * 获取最近的节点实例
 * @param el DOM元素
 * @param specId 指定的节点ID,用于精确匹配
 * @returns 返回节点实例信息,包含文档ID、节点ID和组件记录
 */
export function getClosestNodeInstance(
	el: Element,
	specId: string | undefined
): IPublicTypeNodeInstance<ComponentRecord> | null {
	// 检查元素是否在文档中
	if (!document.contains(el)) {
		return null;
	}
	return getClosestNodeInstanceByElement(el, specId);
}

/**
 * 通过DOM元素获取最近的节点实例
 * @param el DOM元素
 * @param specId 指定的节点ID,用于精确匹配
 * @returns 返回节点实例信息,包含文档ID、节点ID和组件记录
 */
export function getClosestNodeInstanceByElement(
	el: Element,
	specId: string | undefined
): IPublicTypeNodeInstance<ComponentRecord> | null {
	// 向上遍历DOM树
	while (el) {
		// 检查是否为Vue虚拟节点元素
		if (isVNodeHTMLElement(el)) {
			const component = el.__vueParentComponent;
			return getClosestNodeInstanceByComponent(component, specId);
		}
		// 检查是否为自定义的可编辑的HTML元素
		if (isCompRootHTMLElement(el)) {
			const { nodeId, docId, instance } = getCompRootData(el);
			// 如果未指定specId或specId匹配当前节点ID
			if (!specId || specId === nodeId) {
				return {
					docId,
					nodeId,
					instance: createComponentRecord(docId, nodeId, instance.$.uid),
				};
			}
		}
		// 继续向父元素查找
		el = el.parentElement as Element;
	}

	return null;
}

/**
 * 通过Vue组件实例获取最近的节点实例
 * @param instance Vue组件内部实例
 * @param specId 指定的节点ID,用于精确匹配
 * @returns 返回节点实例信息,包含文档ID、节点ID和组件记录
 */
export function getClosestNodeInstanceByComponent(
	instance: ComponentInternalInstance | null,
	specId: string | undefined
): IPublicTypeNodeInstance<ComponentRecord> | null {
	// 向上遍历组件实例树
	while (instance) {
		// 获取组件对应的DOM元素
		const el = instance.vnode.el as Element;
		// 检查是否为自定义的可编辑的HTML元素
		if (el && isCompRootHTMLElement(el)) {
			// 获取元素上存储的节点数据
			const { nodeId, docId, instance } = getCompRootData(el);
			// 如果未指定specId或specId匹配当前节点ID
			if (!specId || specId === nodeId) {
				// 返回节点实例信息
				return {
					docId,
					nodeId,
					instance: createComponentRecord(docId, nodeId, instance.$.uid),
				};
			}
		}
		// 继续向父组件查找
		instance = instance.parent;
	}
	// 未找到匹配的节点实例则返回null
	return null;
}

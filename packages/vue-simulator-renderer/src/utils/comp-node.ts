import { isNil, isObject } from '@arvin-shu/microcode-renderer-core';
import { ComponentInternalInstance, ComponentPublicInstance, VNode } from 'vue';
import { ComponentRecord } from '../interface';

const SYMBOL_VDID = Symbol('_MTCDocId');
const SYMBOL_VNID = Symbol('_MTCNodeId');
const SYMBOL_VInstance = Symbol('_MTCVueInstance');
const SYMBOL_RECORD_FLAG = Symbol('_MTCVueCompRecord');

export interface CompRootHTMLElement extends HTMLElement {
	[SYMBOL_VDID]: string;
	[SYMBOL_VNID]: string;
	[SYMBOL_VInstance]: ComponentPublicInstance;
}

export function isComponentRecord(el: unknown): el is ComponentRecord {
	return isObject(el) && SYMBOL_RECORD_FLAG in el;
}

export function isCompRootHTMLElement(
	el: Element | null | undefined
): el is CompRootHTMLElement {
	return isObject(el) && SYMBOL_VDID in el;
}

/**
 * 创建组件记录对象
 * @param did - 文档ID
 * @param nid - 节点ID
 * @param cid - 组件实例ID
 * @returns 包含组件标识信息的记录对象
 */
export function createComponentRecord(did: string, nid: string, cid: number) {
	return {
		did, // 文档ID
		nid, // 节点ID
		cid, // 组件实例ID
		[SYMBOL_RECORD_FLAG]: true, // 组件记录标识符
	};
}
/**
 * VNode对应的HTML元素接口
 * 扩展了HTMLElement,添加了Vue相关的属性
 */
export interface VNodeHTMLElement extends HTMLElement {
	/** VNode实例 */
	__vnode: VNode;
	/** 父级Vue组件实例 */
	__vueParentComponent: ComponentInternalInstance;
}

export function isVNodeHTMLElement(el: unknown): el is VNodeHTMLElement {
	return isObject(el) && !isNil(el.__vueParentComponent);
}

/**
 * 组件根节点数据接口
 * 用于在组件根节点DOM元素上存储组件相关的关键信息
 * 包括文档ID、节点ID和组件实例,方便后续组件通信和状态管理
 */
export interface CompRootData {
	docId: string; // 文档ID,用于标识组件所属的文档
	nodeId: string; // 节点ID,用于标识组件在文档中的位置
	instance: ComponentPublicInstance; // Vue组件实例,用于访问组件的属性和方法
}

/**
 * 获取组件根节点上存储的数据
 * 通过Symbol作为key来访问DOM元素上存储的组件数据
 * 这样可以避免与其他库的属性冲突,保证数据的隔离性
 */
export function getCompRootData(el: CompRootHTMLElement): CompRootData {
	return {
		docId: el[SYMBOL_VDID],
		nodeId: el[SYMBOL_VNID],
		instance: el[SYMBOL_VInstance],
	};
}

/**
 * 设置组件根节点数据
 * 将组件的关键信息存储到DOM元素上
 * 这样可以在任何地方通过DOM元素快速访问到组件的相关信息
 * 为组件通信、状态管理等功能提供基础支持
 */
export function setCompRootData(
	el: CompRootHTMLElement,
	data: CompRootData
): void {
	el[SYMBOL_VDID] = data.docId;
	el[SYMBOL_VNID] = data.nodeId;
	el[SYMBOL_VInstance] = data.instance;
}

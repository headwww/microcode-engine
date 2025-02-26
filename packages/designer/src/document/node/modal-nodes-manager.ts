import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { IPublicModelModalNodesManager } from '@arvin-shu/microcode-types';
import { DocumentModel } from '../document-model';
import { INode } from './node';

export interface IModalNodesManager
	extends IPublicModelModalNodesManager<INode> {}

/**
 * 模态节点管理器类 - 用于管理页面中的模态框节点
 * 实现了 IModalNodesManager 接口
 */
export class ModalNodesManager implements IModalNodesManager {
	// 销毁时需要执行的清理函数
	willDestroy: any;

	// 当前页面的文档模型实例
	private page: DocumentModel;

	// 事件总线,用于处理模态框相关的事件
	private emitter: IEventBus;

	// 存储所有模态框节点的数组
	private modalNodes: INode[];

	// 存储节点移除事件的映射
	private nodeRemoveEvents: any;

	/**
	 * 构造函数
	 * @param page 页面文档模型实例
	 */
	constructor(page: DocumentModel) {
		this.page = page;
		this.emitter = createModuleEventBus('ModalNodesManager');
		this.nodeRemoveEvents = {};
		this.setNodes();
		this.hideModalNodes();
		// 注册节点创建和销毁的监听器
		this.willDestroy = [
			page.onNodeCreate((node) => this.addNode(node)),
			page.onNodeDestroy((node) => this.removeNode(node)),
		];
	}

	/**
	 * 获取所有模态框节点
	 */
	getModalNodes(): INode[] {
		return this.modalNodes;
	}

	/**
	 * 获取当前可见的模态框节点
	 */
	getVisibleModalNode(): INode | null {
		const visibleNode = this.getModalNodes().find((node: INode) =>
			node.getVisible()
		);
		return visibleNode || null;
	}

	/**
	 * 隐藏所有模态框节点
	 */
	hideModalNodes() {
		this.modalNodes.forEach((node: INode) => {
			node.setVisible(false);
		});
	}

	/**
	 * 设置指定节点为可见
	 * @param node 要显示的节点
	 */
	setVisible(node: INode) {
		this.hideModalNodes();
		node.setVisible(true);
	}

	/**
	 * 设置指定节点为不可见
	 * @param node 要隐藏的节点
	 */
	setInvisible(node: INode) {
		node.setVisible(false);
	}

	/**
	 * 监听可见性变化事件
	 * @param func 回调函数
	 */
	onVisibleChange(func: () => any) {
		this.emitter.on('visibleChange', func);
		return () => {
			this.emitter.removeListener('visibleChange', func);
		};
	}

	/**
	 * 监听模态框节点列表变化事件
	 * @param func 回调函数
	 */
	onModalNodesChange(func: () => any) {
		this.emitter.on('modalNodesChange', func);
		return () => {
			this.emitter.removeListener('modalNodesChange', func);
		};
	}

	/**
	 * 添加新的模态框节点
	 * @param node 要添加的节点
	 */
	private addNode(node: INode) {
		if (node?.componentMeta.isModal) {
			this.hideModalNodes();
			this.modalNodes.push(node);
			this.addNodeEvent(node);
			this.emitter.emit('modalNodesChange');
			this.emitter.emit('visibleChange');
		}
	}

	/**
	 * 移除模态框节点
	 * @param node 要移除的节点
	 */
	private removeNode(node: INode) {
		if (node.componentMeta.isModal) {
			const index = this.modalNodes.indexOf(node);
			if (index >= 0) {
				this.modalNodes.splice(index, 1);
			}
			this.removeNodeEvent(node);
			this.emitter.emit('modalNodesChange');
			if (node.getVisible()) {
				this.emitter.emit('visibleChange');
			}
		}
	}

	/**
	 * 为节点添加可见性变化事件监听
	 * @param node 要添加事件的节点
	 */
	private addNodeEvent(node: INode) {
		this.nodeRemoveEvents[node.id] = node.onVisibleChange(() => {
			this.emitter.emit('visibleChange');
		});
	}

	/**
	 * 移除节点的可见性变化事件监听
	 * @param node 要移除事件的节点
	 */
	private removeNodeEvent(node: INode) {
		if (this.nodeRemoveEvents[node.id]) {
			this.nodeRemoveEvents[node.id]();
			delete this.nodeRemoveEvents[node.id];
		}
	}

	/**
	 * 初始化模态框节点列表
	 */
	setNodes() {
		const nodes = getModalNodes(this.page.rootNode!);
		this.modalNodes = nodes;
		this.modalNodes.forEach((node: INode) => {
			this.addNodeEvent(node);
		});
		this.emitter.emit('modalNodesChange');
	}
}

/**
 * 递归获取指定节点下的所有模态框节点
 * @param node 起始节点
 * @returns 模态框节点数组
 */
export function getModalNodes(node: INode) {
	if (!node) return [];
	let nodes: any = [];
	if (node.componentMeta.isModal) {
		nodes.push(node);
	}
	const { children } = node;
	if (children) {
		children.forEach((child) => {
			nodes = nodes.concat(getModalNodes(child));
		});
	}
	return nodes;
}

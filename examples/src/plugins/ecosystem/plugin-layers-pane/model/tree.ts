import {
	IPublicModelNode,
	IPublicTypePropChangeOptions,
} from '@arvin-shu/microcode-types';
import { TreeNode } from './tree-node';
import { ILayersPanelPluginContext, TreeMaster } from './tree-master';

export class Tree {
	private treeNodesMap = new Map<string, TreeNode>();

	readonly id: string | undefined;

	readonly pluginContext: ILayersPanelPluginContext;

	get root() {
		const focusNode = this.pluginContext.project.currentDocument?.focusNode;
		if (focusNode) {
			return this.getTreeNode(focusNode);
		}
		return null;
	}

	constructor(treeMaster: TreeMaster) {
		this.pluginContext = treeMaster.pluginContext;
		const doc = this.pluginContext.project.currentDocument;
		this.id = doc?.id;

		doc?.onChangeNodeChildren((info: { node: IPublicModelNode }) => {
			const { node } = info;
			const treeNode = this.getTreeNodeById(node.id);
			treeNode?.notifyExpandableChanged();
		});

		doc?.history.onChangeCursor(() => {
			this.root?.notifyExpandableChanged();
		});

		doc?.onChangeNodeProp((info: IPublicTypePropChangeOptions) => {
			const { node, key } = info;
			if (key === '___title___') {
				const treeNode = this.getTreeNodeById(node.id);
				treeNode?.notifyTitleLabelChanged();
			} else if (key === '___condition___') {
				const treeNode = this.getTreeNodeById(node.id);
				treeNode?.notifyConditionChanged();
			}
		});

		doc?.onChangeNodeVisible((node: IPublicModelNode, visible: boolean) => {
			const treeNode = this.getTreeNodeById(node.id);
			treeNode?.setHidden(!visible);
		});

		doc?.onImportSchema(() => {
			this.treeNodesMap = new Map<string, TreeNode>();
		});
	}

	setNodeSelected(nodeId: string): void {
		// 目标节点选中，其他节点展开
		const treeNode = this.treeNodesMap.get(nodeId);
		if (!treeNode) {
			return;
		}
		this.expandAllAncestors(treeNode);
	}

	expandAllAncestors(treeNode: TreeNode | undefined | null) {
		if (!treeNode) {
			return;
		}
		if (treeNode.isRoot()) {
			return;
		}
		const ancestors = [];
		let currentNode: TreeNode | null | undefined = treeNode;
		while (!treeNode.isRoot()) {
			currentNode = currentNode?.parent;
			if (currentNode) {
				ancestors.unshift(currentNode);
			} else {
				break;
			}
		}
		ancestors.forEach((ancestor) => {
			ancestor.setExpanded(true);
		});
	}

	getTreeNode(node: IPublicModelNode): TreeNode {
		if (this.treeNodesMap.has(node.id)) {
			const tnode = this.treeNodesMap.get(node.id)!;
			tnode.setNode(node);
			return tnode;
		}

		const treeNode = new TreeNode(this, node);
		this.treeNodesMap.set(node.id, treeNode);
		return treeNode;
	}

	getTreeNodeById(id: string) {
		return this.treeNodesMap.get(id);
	}

	expandAllDecendants(treeNode: TreeNode | undefined | null) {
		if (!treeNode) {
			return;
		}
		treeNode.setExpanded(true);
		const children = treeNode && treeNode.children;
		if (children) {
			children.forEach((child) => {
				this.expandAllDecendants(child);
			});
		}
	}

	collapseAllDecendants(treeNode: TreeNode | undefined | null): void {
		if (!treeNode) {
			return;
		}
		treeNode.setExpanded(false);
		const children = treeNode && treeNode.children;
		if (children) {
			children.forEach((child) => {
				this.collapseAllDecendants(child);
			});
		}
	}
}

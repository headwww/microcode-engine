import {
	IPublicModelNode,
	IPublicModelSelection,
	IPublicTypeDisposable,
} from '@arvin-shu/microcode-types';
import {
	ISelection,
	INode as InnerNode,
	IDocumentModel as InnerDocumentModel,
} from '@arvin-shu/microcode-designer';
import { toRaw } from 'vue';
import { Node as ShellNode } from './node';
import { selectionSymbol } from '../symbols';

export class Selection implements IPublicModelSelection {
	private readonly [selectionSymbol]: ISelection;

	constructor(document: InnerDocumentModel) {
		this[selectionSymbol] = toRaw(document.selection);
	}

	/**
	 * 返回选中的节点 id
	 */
	get selected(): string[] {
		return this[selectionSymbol].selected;
	}

	/**
	 * return selected Node instance
	 */
	get node(): IPublicModelNode | null {
		const nodes = this.getNodes();
		return nodes && nodes.length > 0 ? nodes[0] : null;
	}

	/**
	 * 选中指定节点（覆盖方式）
	 * @param id
	 */
	select(id: string): void {
		this[selectionSymbol].select(id);
	}

	/**
	 * 批量选中指定节点们
	 * @param ids
	 */
	selectAll(ids: string[]): void {
		this[selectionSymbol].selectAll(ids);
	}

	/**
	 * 移除选中的指定节点
	 * @param id
	 */
	remove(id: string): void {
		this[selectionSymbol].remove(id);
	}

	/**
	 * 清除所有选中节点
	 */
	clear(): void {
		this[selectionSymbol].clear();
	}

	/**
	 * 判断是否选中了指定节点
	 * @param id
	 * @returns
	 */
	has(id: string): boolean {
		return this[selectionSymbol].has(id);
	}

	/**
	 * 选中指定节点（增量方式）
	 * @param id
	 */
	add(id: string): void {
		this[selectionSymbol].add(id);
	}

	/**
	 * 获取选中的节点实例
	 * @returns
	 */
	getNodes(): IPublicModelNode[] {
		const innerNodes = this[selectionSymbol].getNodes();
		const nodes: IPublicModelNode[] = [];
		innerNodes.forEach((node: InnerNode) => {
			const shellNode = ShellNode.create(node);
			if (shellNode) {
				nodes.push(shellNode);
			}
		});
		return nodes;
	}

	/**
	 * 获取选区的顶层节点
	 * for example:
	 *  getNodes() returns [A, subA, B], then
	 *  getTopNodes() will return [A, B], subA will be removed
	 * @returns
	 */
	getTopNodes(includeRoot: boolean = false): IPublicModelNode[] {
		const innerNodes = this[selectionSymbol].getTopNodes(includeRoot);
		const nodes: IPublicModelNode[] = [];
		innerNodes.forEach((node: InnerNode) => {
			const shellNode = ShellNode.create(node);
			if (shellNode) {
				nodes.push(shellNode);
			}
		});
		return nodes;
	}

	onSelectionChange(fn: (ids: string[]) => void): IPublicTypeDisposable {
		return this[selectionSymbol].onSelectionChange(fn);
	}
}

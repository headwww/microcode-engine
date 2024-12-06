import { IPublicModelNode } from '.';
import { IPublicTypeDisposable } from '../type';

export interface IPublicModelSelection<Node = IPublicModelNode> {
	/**
	 * 返回选中的节点 id
	 */
	get selected(): string[];

	/**
	 * 返回选中的节点（如多个节点只返回第一个）
	 */
	get node(): Node | null;

	/**
	 * 选中指定节点（覆盖方式）
	 * @param id
	 */
	select(id: string): void;

	/**
	 * 批量选中指定节点们
	 *
	 * @param ids
	 */
	selectAll(ids: string[]): void;

	/**
	 * 移除选中的指定节点
	 * @param id
	 */
	remove(id: string): void;

	/**
	 * 清除所有选中节点
	 */
	clear(): void;

	/**
	 * 判断是否选中了指定节点
	 * @param id
	 */
	has(id: string): boolean;

	/**
	 * 选中指定节点（增量方式）
	 * @param id
	 */
	add(id: string): void;

	/**
	 * 获取选中的节点实例
	 */
	getNodes(): Node[];

	/**
	 * 获取选区的顶层节点
	 * get seleted top nodes
	 * 例如:
	 *  getNodes() 返回 [A, subA, B], 那么
	 *  getTopNodes() 将返回 [A, B], subA 会被移除
	 */
	getTopNodes(includeRoot?: boolean): Node[];

	/**
	 * 注册 selection 变化事件回调
	 */
	onSelectionChange(fn: (ids: string[]) => void): IPublicTypeDisposable;
}

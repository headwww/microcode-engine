import { IPublicTypeDisposable } from '../type';
import { IPublicModelNode } from './node';

export interface IPublicModelDetecting<Node = IPublicModelNode> {
	/**
	 * 是否启用
	 */
	get enable(): boolean;

	/**
	 * 当前 hover 的节点
	 */
	get current(): Node | null;

	/**
	 * hover 指定节点
	 */
	capture(id: string): void;

	/**
	 * hover 离开指定节点
	 */
	release(id: string): void;

	/**
	 * 清空 hover 态
	 */
	leave(): void;

	/**
	 * hover 节点变化事件
	 */
	onDetectingChange(fn: (node: Node | null) => void): IPublicTypeDisposable;
}

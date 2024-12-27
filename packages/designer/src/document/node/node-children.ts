import {
	IPublicEnumTransformStage,
	IPublicModelNodeChildren,
	IPublicTypeDisposable,
	IPublicTypeNodeData,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { computed, shallowReactive } from 'vue';
import { foreachReverse } from '../../utils';
import { INode, Node } from './node';
import { NodeRemoveOptions } from '../../types';

export interface IOnChangeOptions {
	type: string;
	node: Node;
}

export interface INodeChildren
	extends Omit<
		IPublicModelNodeChildren<INode>,
		'importSchema' | 'exportSchema' | 'isEmpty' | 'notEmpty'
	> {
	children: INode[];

	get owner(): INode;

	get length(): number;

	unlinkChild(node: INode): void;

	internalDelete(
		node: INode,
		purge: boolean,
		useMutator: boolean,
		options: NodeRemoveOptions
	): boolean;

	internalInsert(node: INode, at?: number | null, useMutator?: boolean): void;

	import(
		data?: IPublicTypeNodeData | IPublicTypeNodeData[],
		checkId?: boolean
	): void;

	export(stage: IPublicEnumTransformStage): IPublicTypeNodeData[];

	forEach(fn: (item: INode, index: number) => void): void;

	get(index: number): INode | null;

	isEmpty(): boolean;

	notEmpty(): boolean;

	internalInitParent(): void;

	onChange(fn: (info?: IOnChangeOptions) => void): IPublicTypeDisposable;
}

export class NodeChildren implements INodeChildren {
	children = shallowReactive<INode[]>([]);

	private emitter: IEventBus = createModuleEventBus('NodeChildren');

	private readonly computedSize = computed(() => this.children.length);

	get size(): number {
		return this.computedSize.value;
	}

	get isEmptyNode(): boolean {
		return this.size < 1;
	}

	get notEmptyNode(): boolean {
		return this.size > 0;
	}

	get length(): number {
		return this.children.length;
	}

	private purged = false;

	get [Symbol.toStringTag]() {
		return 'Array';
	}

	constructor(
		readonly owner: INode,
		data: IPublicTypeNodeData | IPublicTypeNodeData[]
	) {
		this.children.push(
			...(Array.isArray(data) ? data : [data])
				.filter((child) => !!child)
				.map((child) => this.owner.document?.createNode(child as any))
				.filter((node): node is INode => node != null)
		);
	}

	internalInitParent() {
		this.children.forEach((child) => child.internalSetParent(this.owner));
	}

	export(
		stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save
	): IPublicTypeNodeData[] {
		return this.children.map((node) => {
			const data = node.export(stage);
			if (node.isLeafNode && IPublicEnumTransformStage.Save === stage) {
				// FIXME: filter empty
				return data.children as IPublicTypeNodeData;
			}
			return data;
		});
	}

	// TODO 未完善协议的导入
	import(data?: IPublicTypeNodeData | IPublicTypeNodeData[], checkId = false) {
		console.log(checkId);
	}

	isEmpty() {
		return this.isEmptyNode;
	}

	notEmpty() {
		return this.notEmptyNode;
	}

	purge() {
		if (this.purged) {
			return;
		}
		this.purged = true;
		this.children.forEach((child) => {
			child.purge();
		});
	}

	/**
	 * 移除一个子节点
	 *
	 * @param node
	 */
	unlinkChild(node: INode) {
		const i = this.children.map((d) => d.id).indexOf(node.id);
		if (i < 0) {
			return false;
		}
		this.children.splice(i, 1);
		this.emitter.emit('change', {
			type: 'unlink',
			node,
		});
	}

	/**
	 * 删除一个节点
	 */
	delete(node: INode): boolean {
		return this.internalDelete(node);
	}

	/**
	 * 删除一个节点
	 */
	internalDelete(
		node: INode,
		purge = false,
		useMutator = true,
		options: NodeRemoveOptions = {}
	) {
		node.internalPurgeStart();
		if (node.isParentalNode) {
			// 删除一下子节点和插槽节点避免内存泄露
			node.children &&
				foreachReverse(
					node.children as any,
					(subNode: Node) => {
						subNode.remove(useMutator, purge, options);
					},
					(iterable, idx) => (iterable as NodeChildren).get(idx)
				);

			foreachReverse(
				node.slots,
				(slotNode: Node) => {
					slotNode.remove(useMutator, purge);
				},
				(iterable, idx) => (iterable as [])[idx]
			);
		}

		// 需要在从 children 中删除 node 前记录下 index，internalSetParent 中会执行删除 (unlink) 操作
		const i = this.children.map((d) => d.id).indexOf(node.id);

		// 彻底删除一个节点
		if (purge) {
			// 解绑父节点
			node.internalSetParent(null, useMutator);
			try {
				node.purge();
			} catch (err) {
				// eslint-disable-next-line no-console
				console.error(err);
			}
		}
		const { document } = node;
		const editor = node.document?.designer.editor;
		editor?.eventBus.emit('node.remove', { node, index: i });
		document?.unlinkNode(node);
		// TODO selection 相关逻辑
		document?.destroyNode(node);
		this.emitter.emit('change', {
			type: 'delete',
			node,
		});

		// TODO reportModified
		useMutator;

		if (i > -1 && !purge) {
			this.children.splice(i, 1);
		}

		return false;
	}

	insert(node: INode, at?: number | null): void {
		this.internalInsert(node, at, true);
	}

	internalInsert(node: INode, at?: number | null, useMutator?: boolean): void {
		const { children } = this;
		let index = at == null || at === -1 ? children.length : at;

		const i = children.map((d) => d.id).indexOf(node.id);

		if (node.parent) {
			const editor = node.document?.designer.editor;
			editor?.eventBus.emit('node.remove.topLevel', {
				node,
				index: node.index,
			});
		}

		if (i < 0) {
			if (index < children.length) {
				children.splice(index, 0, node);
			} else {
				children.push(node);
			}
			node.internalSetParent(this.owner, true);
		} else {
			// 如果节点已在children中,处理移动逻辑
			// 如果目标位置在原位置之后,需要减1以补偿即将删除的位置
			if (index > i) {
				index -= 1;
			}

			// 如果目标位置与原位置相同,无需移动
			if (index === i) {
				return;
			}

			// 移除原位置的节点并插入到新位置
			children.splice(i, 1);
			children.splice(index, 0, node);
		}
		// 触发change事件
		this.emitter.emit('change', {
			type: 'insert',
			node,
		});
		// 触发insert事件
		this.emitter.emit('insert', node);

		const editor = node.document?.designer.editor;
		editor?.eventBus.emit('node.add', { node });

		// TODO reportModified
		useMutator;
		// TODO 条件组相关逻辑未设计
	}

	/**
	 * 取得节点索引编号
	 */
	indexOf(node: INode): number {
		return this.children.map((d) => d.id).indexOf(node.id);
	}

	/**
	 * 根据索引获得节点
	 */
	get(index: number): INode | null {
		return this.children.length > index ? this.children[index] : null;
	}

	splice(start: number, deleteCount: number, node?: INode): INode[] {
		if (node) {
			return this.children.splice(start, deleteCount, node);
		}
		return this.children.splice(start, deleteCount);
	}

	has(node: INode) {
		return this.indexOf(node) > -1;
	}

	[Symbol.iterator](): { next(): { value: INode } } {
		let index = 0;
		const { children } = this;
		const length = children.length || 0;
		return {
			next() {
				if (index < length) {
					return {
						value: children[index++],
						done: false,
					};
				}
				return {
					value: undefined as any,
					done: true,
				};
			},
		};
	}

	forEach(fn: (item: INode, index: number) => void): void {
		this.children.forEach((child, index) => fn(child, index));
	}

	map<T>(fn: (item: INode, index: number) => T): T[] | null {
		return this.children.map((child, index) => fn(child, index));
	}

	every(fn: (item: INode, index: number) => any): boolean {
		return this.children.every((child, index) => fn(child, index));
	}

	some(fn: (item: INode, index: number) => any): boolean {
		return this.children.some((child, index) => fn(child, index));
	}

	filter(fn: (item: INode, index: number) => any): any {
		return this.children.filter(fn);
	}

	find(fn: (item: INode, index: number) => boolean): INode | undefined {
		return this.children.find(fn);
	}

	reduce(fn: (acc: any, cur: INode) => any, initialValue: any): void {
		return this.children.reduce(fn, initialValue);
	}

	reverse() {
		return this.children.reverse();
	}

	// TODO 为设计合并子节点mergeChildren

	onChange(fn: (info?: IOnChangeOptions) => void): IPublicTypeDisposable {
		this.emitter.on('change', fn);
		return () => {
			this.emitter.removeListener('change', fn);
		};
	}

	onInsert(fn: (node: INode) => void) {
		this.emitter.on('insert', fn);
		return () => {
			this.emitter.removeListener('insert', fn);
		};
	}
}

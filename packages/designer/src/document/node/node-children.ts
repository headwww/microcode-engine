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
import { isNodeSchema, shallowEqual } from '@arvin-shu/microcode-utils';
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

	/**
	 * 删除一个节点
	 */
	internalDelete(
		node: INode,
		purge: boolean,
		useMutator: boolean,
		options: NodeRemoveOptions
	): boolean;

	/**
	 * 插入一个节点，返回新长度
	 */
	internalInsert(node: INode, at?: number | null, useMutator?: boolean): void;

	import(
		data?: IPublicTypeNodeData | IPublicTypeNodeData[],
		checkId?: boolean
	): void;

	/**
	 * 导出 schema
	 */
	export(stage: IPublicEnumTransformStage): IPublicTypeNodeData[];

	/** following methods are overriding super interface, using different param types */
	/** overriding methods start */

	forEach(fn: (item: INode, index: number) => void): void;

	/**
	 * 根据索引获得节点
	 */
	get(index: number): INode | null;

	isEmpty(): boolean;

	notEmpty(): boolean;

	internalInitParent(): void;

	onChange(fn: (info?: IOnChangeOptions) => void): IPublicTypeDisposable;

	/** overriding methods end */
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

	/**
	 * 导入节点数据
	 * @param data 要导入的节点数据,可以是单个节点数据或节点数据数组
	 * @param checkId 是否检查节点id,默认为false
	 */
	import(data?: IPublicTypeNodeData | IPublicTypeNodeData[], checkId = false) {
		// 标准化输入数据:转换成数组并过滤掉空值
		data = (data ? (Array.isArray(data) ? data : [data]) : []).filter(
			(d) => !!d
		);

		// 保存原有子节点的副本
		const originChildren = this.children.slice();
		// 解除所有子节点与父节点的关联
		this.children.forEach((child) => child.internalSetParent(null));

		// 创建新的子节点数组
		const children = new Array<Node>(data.length);
		for (let i = 0, l = data.length; i < l; i++) {
			const child = originChildren[i]; // 原有的子节点
			const item = data[i]; // 新的节点数据

			let node: INode | undefined | null;
			// 如果新节点数据符合节点schema,且不需要检查id,且存在对应的原节点,且组件名相同
			if (
				isNodeSchema(item) &&
				!checkId &&
				child &&
				child.componentName === item.componentName
			) {
				// 复用原有节点,仅更新数据
				node = child;
				node.import(item as any);
			} else {
				// 否则创建新节点
				node = this.owner.document?.createNode(item as any);
			}
			children[i] = node as any;
		}

		// 更新子节点列表
		this.children = children;
		// 重新建立父子关系
		this.internalInitParent();
		// 如果子节点发生变化,触发change事件
		if (!shallowEqual(children, originChildren)) {
			this.emitter.emit('change');
		}
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
				// 从后往前删除
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
		document?.selection.remove(node.id);
		document?.destroyNode(node);
		this.emitter.emit('change', {
			type: 'delete',
			node,
		});

		if (useMutator) {
			this.reportModified(node, this.owner, {
				type: 'remove',
				propagated: false,
				isSubDeleting: this.owner.isPurging,
				removeIndex: i,
				removeNode: node,
			});
		}
		// purge 为 true 时，已在 internalSetParent 中删除了子节点

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

		// 如果需要触发修改事件
		if (useMutator) {
			this.reportModified(node, this.owner, { type: 'insert' });
		}
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

	/**
	 * 合并子节点
	 */
	mergeChildren(
		remover: (node: INode, idx: number) => boolean,
		adder: (children: INode[]) => IPublicTypeNodeData[] | null,
		sorter: (firstNode: INode, secondNode: INode) => number
	): any {
		let changed = false;
		if (remover) {
			const willRemove = this.children.filter(remover);
			if (willRemove.length > 0) {
				willRemove.forEach((node) => {
					const i = this.children.map((d) => d.id).indexOf(node.id);
					if (i > -1) {
						this.children.splice(i, 1);
						node.remove(false);
					}
				});
				changed = true;
			}
		}
		if (adder) {
			const items = adder(this.children);
			if (items && items.length > 0) {
				items.forEach((child: IPublicTypeNodeData) => {
					const node: INode = this.owner.document?.createNode(
						child as any
					) as any;
					this.children.push(node);
					node.internalSetParent(this.owner);
					/* istanbul ignore next */
					const editor = node.document?.designer.editor;
					editor?.eventBus.emit('node.add', { node });
				});
				changed = true;
			}
		}
		if (sorter) {
			this.children = this.children.sort(sorter);
			changed = true;
		}
		if (changed) {
			this.emitter.emit('change');
		}
	}

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

	/**
	 * 报告节点修改
	 * 当节点发生变化时,向上传递修改事件,触发相应的回调
	 *
	 * 组件自定义行为处理:
	 * - 允许组件通过 onSubtreeModified 回调来响应其子树的变化
	 * - 比如:容器组件可能需要在子组件增删时重新计算布局
	 *
	 * 变更传播:
	 * - 通过递归调用,将修改事件向上传播到父节点
	 * - 确保整个组件树上的相关组件都能感知到变化
	 *
	 * 场景示例:{
    componentName: 'Layout',
    advanced: {
        callbacks: {
            onSubtreeModified(node, owner, options) {
                if (options.type === 'insert') {
                    // 处理新增子节点
                    this.recomputeLayout();
                } else if (options.type === 'remove') {
                    // 处理删除子节点
                    this.adjustLayout();
                }
            }
        }
    }
}
	 * 
	 * - 当你在一个 Layout 组件中添加/删除子组件时
	 * - Layout 组件可能需要重新计算布局、调整样式
	 * - 通过 onSubtreeModified 回调,Layout 可以立即响应这些变化
	 *
	 * 总的来说,reportModified 是一个重要的变更通知机制,它:
	 * - 使组件能够响应其子树的结构变化
	 * - 保证了组件树中的数据一致性
	 * - 支持复杂的组件间联动行为
	 *
	 * @param node 发生变化的节点
	 * @param owner 当前节点的所有者
	 * @param options 额外的选项参数
	 */
	private reportModified(node: INode, owner: INode, options = {}) {
		// 如果节点不存在,直接返回
		if (!node) {
			return;
		}
		// 如果是根节点,不需要继续向上传递
		if (node.isRootNode) {
			return;
		}

		// 获取组件元数据中定义的回调函数
		const callbacks = owner.componentMeta?.advanced.callbacks;
		// 如果存在子树修改的回调函数
		if (callbacks?.onSubtreeModified) {
			try {
				// 执行回调函数,传入节点的外壳对象和所有者的外壳对象
				callbacks?.onSubtreeModified.call(
					node.internalToShellNode(),
					owner.internalToShellNode() as any,
					options
				);
			} catch (e) {
				// 如果执行回调时发生错误,打印错误信息
				// eslint-disable-next-line no-console
				console.error(
					'error when execute advanced.callbacks.onSubtreeModified',
					e
				);
			}
		}

		// 如果所有者有父节点且父节点不是根节点
		// 则继续向上传递修改事件
		if (owner.parent && !owner.parent.isRootNode) {
			this.reportModified(node, owner.parent, { ...options, propagated: true });
		}
	}
}

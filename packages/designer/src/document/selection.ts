import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { IPublicModelSelection } from '@arvin-shu/microcode-types';
import { shallowRef } from 'vue';
import { DocumentModel } from './document-model';
import { comparePosition, INode, PositionNO } from './node';
/**
 * 选区接口定义
 * 继承自IPublicModelSelection，但排除node属性
 */
export interface ISelection extends Omit<IPublicModelSelection<INode>, 'node'> {
	/**
	 * 判断选区是否包含指定节点
	 * @param node 要检查的节点
	 * @param excludeRoot 是否排除根节点
	 */
	containsNode(node: INode, excludeRoot: boolean): boolean;
}

/**
 * 选区管理类
 * 负责管理画布中节点的选中状态
 */
export class Selection implements ISelection {
	/**
	 * 选区事件总线,用于发布选区变更事件
	 */
	private emitter: IEventBus = createModuleEventBus('Selection');

	/**
	 * 已选中节点ID列表
	 * 使用shallowReactive实现响应式
	 */
	private _selected = shallowRef<string[]>([]);

	/**
	 * 构造函数
	 * @param doc 关联的文档模型实例
	 */
	// eslint-disable-next-line no-useless-constructor, no-empty-function
	constructor(readonly doc: DocumentModel) {}

	/**
	 * 获取当前选中的节点ID列表
	 */
	get selected(): string[] {
		return this._selected.value;
	}

	/**
	 * 选中单个节点
	 * @param id 要选中的节点ID
	 */
	select(id: string) {
		// 如果已经是单选且选中的就是该节点,则不触发更新
		if (
			this._selected.value.length === 1 &&
			this._selected.value.indexOf(id) > -1
		) {
			// avoid cause reaction
			return;
		}

		const node = this.doc.getNode(id);

		// 检查节点是否可选
		if (!node?.canSelect()) {
			return;
		}

		this._selected.value = [id];
		this.emitter.emit('selectionchange', this._selected);
	}

	/**
	 * 批量选中多个节点
	 * @param ids 要选中的节点ID列表
	 */
	selectAll(ids: string[]) {
		const selectIds: string[] = [];

		// 过滤出可选的节点
		ids.forEach((d) => {
			const node = this.doc.getNode(d);

			if (node?.canSelect()) {
				selectIds.push(d);
			}
		});

		this._selected.value = selectIds;

		this.emitter.emit('selectionchange', this._selected);
	}

	/**
	 * 清空选区
	 */
	clear() {
		if (this._selected.value.length < 1) {
			return;
		}
		this._selected.value.length = 0;
		this.emitter.emit('selectionchange', this._selected);
	}

	/**
	 * 整理选区,移除已不存在的节点
	 */
	dispose() {
		const l = this._selected.value.length;
		let i = l;
		while (i-- > 0) {
			const id = this._selected.value[i];
			if (!this.doc.hasNode(id)) {
				this._selected.value.splice(i, 1);
			}
		}
		if (this._selected.value.length !== l) {
			this.emitter.emit('selectionchange', this._selected);
		}
	}

	/**
	 * 添加节点到选区
	 * @param id 要添加的节点ID
	 */
	add(id: string) {
		if (this._selected.value.indexOf(id) > -1) {
			return;
		}

		this._selected.value.push(id);
		this.emitter.emit('selectionchange', this._selected);
	}

	/**
	 * 检查节点是否在选区内
	 * @param id 要检查的节点ID
	 */
	has(id: string) {
		return this._selected.value.indexOf(id) > -1;
	}

	/**
	 * 从选区移除节点
	 * @param id 要移除的节点ID
	 */
	remove(id: string) {
		const i = this._selected.value.indexOf(id);
		if (i > -1) {
			this._selected.value.splice(i, 1);
			this.emitter.emit('selectionchange', this._selected);
		}
	}

	/**
	 * 检查选区是否包含指定节点
	 * @param node 要检查的节点
	 * @param excludeRoot 是否排除根节点
	 */
	containsNode(node: INode, excludeRoot = false) {
		for (const id of this._selected.value) {
			const parent = this.doc.getNode(id);
			if (excludeRoot && parent?.contains(this.doc.focusNode)) {
				continue;
			}
			if (parent?.contains(node)) {
				return true;
			}
		}
		return false;
	}

	/**
	 * 获取选区中的所有节点实例
	 */
	getNodes(): INode[] {
		const nodes: INode[] = [];
		for (const id of this._selected.value) {
			const node = this.doc.getNode(id);
			if (node) {
				nodes.push(node);
			}
		}
		return nodes;
	}

	/**
	 * 获取选区中的顶层节点
	 * 如果一个节点是另一个选中节点的子节点,则只返回父节点
	 *
	 * 例如:
	 * div (id: 1)
	 *  ├── span (id: 2)
	 *  │     └── text (id: 3)
	 *  └── p (id: 4)
	 *
	 * 如果同时选中了id 2(span)和id 3(text),getTopNodes将只返回id 2(span)节点
	 *
	 * @param includeRoot 是否包含根节点
	 */
	getTopNodes(includeRoot = false) {
		const nodes = [];
		for (const id of this._selected.value) {
			const node = this.doc.getNode(id);
			// 排除根节点
			if (!node || (!includeRoot && node.contains(this.doc.focusNode))) {
				continue;
			}
			let i = nodes.length;
			let isTop = true;
			while (i-- > 0) {
				const n = comparePosition(nodes[i], node);
				// nodes[i] contains node
				if (n === PositionNO.Contains || n === PositionNO.TheSame) {
					isTop = false;
					break;
				} else if (n === PositionNO.ContainedBy) {
					// node contains nodes[i], delete nodes[i]
					nodes.splice(i, 1);
				}
			}
			// node is top item, push to nodes
			if (isTop) {
				nodes.push(node);
			}
		}
		return nodes;
	}

	/**
	 * 监听选区变化事件
	 * @param fn 选区变化回调函数
	 * @returns 取消监听的函数
	 */
	onSelectionChange(fn: (ids: string[]) => void): () => void {
		this.emitter.on('selectionchange', fn);
		return () => {
			this.emitter.removeListener('selectionchange', fn);
		};
	}
}

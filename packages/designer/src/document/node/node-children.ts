import {
	IPublicEnumTransformStage,
	IPublicModelNodeChildren,
	IPublicTypeNodeData,
} from '@arvin-shu/microcode-types';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import { computed, shallowReactive } from 'vue';
import { INode } from './node';

export interface INodeChildren
	extends Omit<
		IPublicModelNodeChildren<INode>,
		'importSchema' | 'exportSchema' | 'isEmpty' | 'notEmpty'
	> {
	size: number;
	export: (stage: IPublicEnumTransformStage) => any[];
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
		// 保证向前兼容性
		return 'Array';
	}

	constructor(
		readonly owner: INode,
		data: IPublicTypeNodeData | IPublicTypeNodeData[]
	) {
		this.children = (Array.isArray(data) ? data : [data])
			.filter((child) => !!child)
			.map((child) => this.owner.document?.createNode(child as any))
			.filter((node): node is INode => node != null);
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

	insert(node: INode, at?: number | null): void {
		console.log(node, at);

		throw new Error('Method not implemented.');
	}
}

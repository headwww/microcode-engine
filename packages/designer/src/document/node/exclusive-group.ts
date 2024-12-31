import {
	IPublicModelExclusiveGroup,
	IPublicTypeTitleContent,
} from '@arvin-shu/microcode-types';
import { uniqueId } from '@arvin-shu/microcode-utils';
import { computed, ref, shallowReactive } from 'vue';
import { INode } from './node';
import { intl } from '../../locale';

export interface IExclusiveGroup extends IPublicModelExclusiveGroup<INode> {
	readonly name: string;

	get index(): number | undefined;

	remove(node: INode): void;

	add(node: INode): void;

	isVisible(node: INode): boolean;

	get length(): number;

	get visibleNode(): INode;
}

/**
 * 是一个互斥组的实现类，主要用于管理一组互斥的节点（nodes），其中同一时间只能有一个节点可见。这在以下场景中特别有用：
 *条件渲染场景：比如 if-else-if 这样的条件组，同一时间只能显示一个条件分支
 *模态框管理：处理多个模态框（modals）的显示状态
 */
export class ExclusiveGroup implements IExclusiveGroup {
	readonly isExclusiveGroup = true;

	readonly id = uniqueId('exclusive');

	readonly title: IPublicTypeTitleContent;

	readonly children = shallowReactive<INode[]>([]);

	private visibleIndex = ref(0);

	private readonly computedZLevel = computed(() => this.visibleNode.zLevel);

	get zLevel() {
		return this.computedZLevel.value;
	}

	private readonly computedLength = computed(() => this.children.length);

	get length() {
		return this.computedLength.value;
	}

	private readonly computedVisibleNode = computed(
		() => this.children[this.visibleIndex.value]
	);

	get visibleNode() {
		return this.computedVisibleNode.value;
	}

	private readonly computedFirstNode = computed(() => this.children[0]!);

	get firstNode() {
		return this.computedFirstNode.value;
	}

	private readonly computedDocument = computed(() => this.visibleNode.document);

	get document() {
		return this.computedDocument.value;
	}

	get index() {
		return this.firstNode.index;
	}

	constructor(
		readonly name: string,
		title?: IPublicTypeTitleContent
	) {
		this.title = title || {
			type: 'i18n',
			intl: intl('Condition Group'),
		};
	}

	add(node: INode) {
		if (node.nextSibling && node.nextSibling.conditionGroup?.id === this.id) {
			const i = this.children.indexOf(node.nextSibling);
			this.children.splice(i, 0, node);
		} else {
			this.children.push(node);
		}
	}

	remove(node: INode) {
		const i = this.children.indexOf(node);
		if (i > -1) {
			this.children.splice(i, 1);
			if (this.visibleIndex.value > i) {
				this.visibleIndex.value -= 1;
			} else if (this.visibleIndex.value >= this.children.length) {
				this.visibleIndex.value = this.children.length - 1;
			}
		}
	}

	setVisible(node: INode) {
		const i = this.children.indexOf(node);
		if (i > -1) {
			this.visibleIndex.value = i;
		}
	}

	isVisible(node: INode) {
		const i = this.children.indexOf(node);
		return i === this.visibleIndex.value;
	}
}

export function isExclusiveGroup(obj: any): obj is ExclusiveGroup {
	return obj && obj.isExclusiveGroup;
}

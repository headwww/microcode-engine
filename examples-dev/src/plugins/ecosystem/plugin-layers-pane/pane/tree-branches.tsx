import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
	toRaw,
} from 'vue';
import {
	IPublicModelExclusiveGroup,
	IPublicTypeDisposable,
	IPublicTypeLocationChildrenDetail,
} from '@arvin-shu/microcode-types';
import { Title } from '@arvin-shu/microcode-editor-core';
import { TreeNode } from '../model/tree-node';
import { TreeNodeView } from './tree-node';
import { intlNode } from '../locale';

export const TreeBranches = defineComponent({
	name: 'TreeBranches',
	inheritAttrs: false,
	props: {
		treeNode: {
			type: Object as PropType<TreeNode>,
			required: true,
		},
		treeChildren: {
			type: Array as PropType<TreeNode[]>,
		},
		isModal: Boolean,
		expanded: Boolean,
	},
	setup(props) {
		const { treeNode } = props;

		return () => {
			if (!props.expanded) {
				return null;
			}

			return (
				<div class="mtc-tree-node-branches">
					{!props.isModal && <TreeNodeSlots treeNode={treeNode} />}
					<TreeNodeChildren
						treeNode={treeNode}
						isModal={props.isModal || false}
						treeChildren={props.treeChildren}
					/>
				</div>
			);
		};
	},
});

export const TreeNodeChildren = defineComponent({
	name: 'TreeNodeChildren',
	inheritAttrs: false,
	props: {
		treeNode: {
			type: Object as PropType<TreeNode>,
			required: true,
		},
		treeChildren: {
			type: Array as PropType<TreeNode[]>,
		},
		isModal: Boolean,
	},
	setup(props) {
		const dropDetail = ref<
			IPublicTypeLocationChildrenDetail | undefined | null
		>(null);

		let offLocationChanged: IPublicTypeDisposable | undefined;

		onMounted(() => {
			const project = props.treeNode.pluginContext.project;

			offLocationChanged = project.currentDocument?.onDropLocationChanged(
				() => {
					dropDetail.value = props.treeNode.dropDetail;
				}
			);
		});

		onBeforeUnmount(() => {
			offLocationChanged?.();
		});

		return () => {
			const children: any[] = [];
			let currentGrp: IPublicModelExclusiveGroup;
			let groupContents: any[] = [];

			const endGroup = () => {
				if (groupContents.length > 0) {
					children.push(
						<div
							key={currentGrp.id}
							class="condition-group-container"
							data-id={currentGrp.firstNode?.id}
						>
							<div class="condition-group-title">
								<Title title={currentGrp.title} />
							</div>
							{groupContents}
						</div>
					);
					groupContents = [];
				}
			};

			const dropIndex = dropDetail.value?.index;
			const insertion = (
				<div
					key="insertion"
					class={{
						insertion: true,
						invalid: dropDetail.value?.valid === false,
					}}
				/>
			);

			props.treeChildren?.forEach((item, index) => {
				const child = toRaw(item);
				const childIsModal = child.node.componentMeta?.isModal || false;

				if (props.isModal !== childIsModal) {
					return;
				}

				const { conditionGroup } = child.node;
				if (conditionGroup !== currentGrp) {
					endGroup();
				}
				if (conditionGroup) {
					currentGrp = conditionGroup;
					if (index === dropIndex) {
						if (groupContents.length > 0) {
							groupContents.push(insertion);
						} else {
							children.push(insertion);
						}
					}
					groupContents.push(
						<TreeNodeView
							key={child.nodeId}
							treeNode={child}
							isModal={props.isModal}
						/>
					);
				} else {
					if (index === dropIndex) {
						children.push(insertion);
					}
					children.push(
						<TreeNodeView
							key={child.nodeId}
							treeNode={child}
							isModal={props.isModal}
						/>
					);
				}
			});
			endGroup();
			const length = props.treeChildren?.length || 0;
			if (dropIndex != null && dropIndex >= length) {
				children.push(insertion);
			}

			return <div class="mtc-tree-node-children">{children}</div>;
		};
	},
});

export const TreeNodeSlots = defineComponent({
	name: 'TreeNodeSlots',
	inheritAttrs: false,
	props: {
		treeNode: {
			type: Object as PropType<TreeNode>,
			required: true,
		},
	},
	setup(props) {
		return () => {
			const { treeNode } = props;
			if (!treeNode.hasSlots()) {
				return null;
			}

			return (
				<div
					class={{
						'mtc-tree-node-slots': true,
						'insertion-at-slots': treeNode.dropDetail?.focus?.type === 'slots',
					}}
					data-id={props.treeNode.nodeId}
				>
					<div class="mtc-tree-node-slots-title">
						<Title
							title={{
								type: 'i18n',
								intl: intlNode('Slots'),
							}}
						></Title>
					</div>
					{treeNode.slots.map((tnode) => (
						<TreeNodeView key={tnode.nodeId} treeNode={tnode} />
					))}
				</div>
			);
		};
	},
});

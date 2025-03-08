import {
	computed,
	defineComponent,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
	watch,
} from 'vue';
import {
	IPublicModelModalNodesManager,
	IPublicTypeDisposable,
} from '@arvin-shu/microcode-types';
import { TreeNode } from '../model/tree-node';
import { TreeTitle } from './tree-title';
import { TreeBranches } from './tree-branches';
import { intlNode } from '../locale';
import { CloseEyeIcon } from '../icons';

export const TreeNodeView = defineComponent({
	name: 'TreeNodeView',
	inheritAttrs: false,
	props: {
		treeNode: {
			type: Object as PropType<TreeNode>,
			required: true,
		},
		isModal: Boolean,
		isRootNode: Boolean,
	},
	setup(props) {
		const className = computed(() => ({
			'mtc-tree-node': true,
			// 是否展开
			expanded: expanded.value,
			// 是否隐藏的
			hidden: hidden.value,
			// 是否选中
			selected: selected.value,
			// 是否锁定的
			locked: locked.value,
			// 是否投放响应
			dropping: dropping.value,
			// 是否悬停中
			detecting: detecting.value,
			'is-root': props.treeNode.isRoot(),
			'condition-flow': props.treeNode.node.conditionGroup != null,
			highlight: highlight.value,
		}));

		const hidden = ref(props.treeNode.hidden);
		const locked = ref(props.treeNode.locked);
		const expanded = ref(props.isRootNode ? true : props.treeNode.expanded);
		const expandable = ref(props.treeNode.expandable);
		const highlight = ref(props.treeNode.isFocusingNode());
		const treeChildren = ref(props.treeNode.children);
		const selected = ref(props.treeNode.selected);
		const detecting = ref(props.treeNode.detecting);
		const dropping = ref(false);

		watch(
			() => props.treeNode.dropDetail?.index,
			(v) => {
				dropping.value = v !== undefined;
			}
		);

		watch(
			() => props.treeNode.selected,
			(v) => {
				selected.value = v;
			}
		);

		watch(
			() => props.treeNode.detecting,
			(v) => {
				detecting.value = v;
			}
		);

		const eventOffCallbacks: Array<IPublicTypeDisposable | undefined> = [];

		const dispose = [
			props.treeNode.onExpandedChanged((v: boolean) => {
				expanded.value = v;
			}),
			props.treeNode.onExpandableChanged((e) => {
				expandable.value = e;
				treeChildren.value = props.treeNode.children;
			}),

			props.treeNode.onHiddenChanged((value: boolean) => {
				hidden.value = value;
			}),

			props.treeNode.onLockedChanged((value: boolean) => {
				locked.value = value;
			}),
		];

		onMounted(() => {
			const { project } = props.treeNode.pluginContext;
			const doc = project.currentDocument;

			eventOffCallbacks.push(
				doc?.onDropLocationChanged(() => {
					dropping.value = props.treeNode.dropDetail?.index != null;
				})
			);

			const offSelectionChange = doc?.selection?.onSelectionChange(() => {
				selected.value = props.treeNode.selected;
			});
			eventOffCallbacks.push(offSelectionChange!);
			const offDetectingChange = doc?.detecting?.onDetectingChange(() => {
				detecting.value = props.treeNode.detecting;
			});
			eventOffCallbacks.push(offDetectingChange!);
		});

		onBeforeUnmount(() => {
			dispose.forEach((d) => d());
			eventOffCallbacks.forEach((d) => d?.());
		});

		function shouldShowModalTreeNode() {
			const { treeNode, isRootNode } = props;
			if (!isRootNode) {
				// 只在 当前树 的根节点展示模态节点
				return false;
			}

			// 当指定了新的根节点时，要从原始的根节点去获取模态节点
			const { project } = treeNode.pluginContext;
			const rootNode = project.currentDocument?.root;
			const rootTreeNode = treeNode.tree.getTreeNode(rootNode!);
			const modalNodes = rootTreeNode.children?.filter(
				(item) => item.node.componentMeta?.isModal
			);
			return !!(modalNodes && modalNodes.length > 0);
		}

		return () => {
			const { treeNode, isModal } = props;

			return (
				<div class={className.value} data-id={treeNode.nodeId}>
					<TreeTitle
						isModal={isModal}
						hidden={hidden.value}
						locked={locked.value}
						treeNode={treeNode}
						expanded={expanded.value}
						expandable={expandable.value}
					/>
					{shouldShowModalTreeNode() && (
						<ModalTreeNodeView treeNode={treeNode} />
					)}
					<TreeBranches
						treeNode={treeNode}
						isModal={false}
						expanded={expanded.value}
						treeChildren={treeChildren.value}
					/>
				</div>
			);
		};
	},
});

export const ModalTreeNodeView = defineComponent({
	name: 'ModalTreeNodeView',
	inheritAttrs: false,
	props: {
		treeNode: {
			type: Object as PropType<TreeNode>,
			required: true,
		},
	},
	setup(props) {
		const treeChildren = ref<TreeNode[] | null>(null);
		const modalNodesManager = ref<
			IPublicModelModalNodesManager | null | undefined
		>(null);
		const pluginContext = props.treeNode.pluginContext;

		const rootTreeNode = computed(() => {
			const { project } = pluginContext;
			const rootNode = project.currentDocument?.root;
			return props.treeNode.tree.getTreeNode(rootNode!);
		});

		onMounted(() => {
			const { project } = pluginContext;
			modalNodesManager.value = project.currentDocument?.modalNodesManager;
			treeChildren.value = rootTreeNode.value.children;

			rootTreeNode.value.onExpandableChanged(() => {
				treeChildren.value = rootTreeNode.value.children;
			});
		});
		const hideAllNodes = () => {
			modalNodesManager.value?.hideModalNodes();
		};

		const hasVisibleModalNode = computed(
			() => !!modalNodesManager.value?.getVisibleModalNode()
		);

		return () => (
			<div class="mtc-tree-node-modal">
				<div class="mtc-tree-node-modal-title">
					<span>{intlNode('Modal View')}</span>
					<div
						class="mtc-tree-node-modal-title-visible-icon"
						onClick={hideAllNodes}
					>
						{hasVisibleModalNode.value ? (
							<CloseEyeIcon
								style={{
									height: '18px',
									width: '18px',
								}}
							/>
						) : null}
					</div>
				</div>
				<div class="mtc-tree-pane-modal-content">
					<TreeBranches
						treeNode={rootTreeNode.value}
						treeChildren={treeChildren.value}
						expanded={rootTreeNode.value.expanded}
						isModal={true}
					></TreeBranches>
				</div>
			</div>
		);
	},
});

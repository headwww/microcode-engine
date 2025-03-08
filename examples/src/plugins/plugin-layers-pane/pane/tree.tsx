import { defineComponent, onMounted, PropType, ref, toRaw } from 'vue';
import {
	canClickNode,
	isFormEvent,
	isShaken,
} from '@arvin-shu/microcode-utils';
import {
	IPublicEnumDragObjectType,
	IPublicModelNode,
} from '@arvin-shu/microcode-types';
import { Tree } from '../model';
import { TreeNodeView } from './tree-node';

function getTreeNodeIdByEvent(e: MouseEvent, stop: Element): null | string {
	let target: Element | null = e.target as Element;
	if (!target || !stop.contains(target)) {
		return null;
	}
	target = target.closest('[data-id]');
	if (!target || !stop.contains(target)) {
		return null;
	}

	return (target as HTMLDivElement).dataset.id || null;
}

export const TreeView = defineComponent({
	name: 'TreeView',
	inheritAttrs: false,
	props: {
		tree: {
			type: Object as PropType<Tree>,
		},
	},
	setup(props) {
		const root = ref(toRaw(props.tree)?.root);

		const shell = ref<HTMLDivElement>();

		const ignoreUpSelected = ref(false);

		let boostEvent: MouseEvent | undefined;

		onMounted(() => {
			const tree = toRaw(props.tree);
			const doc = tree?.pluginContext.project.getCurrentDocument();
			doc?.onFocusNodeChanged(() => {
				root.value = tree?.root;
			});
			doc?.onImportSchema(() => {
				root.value = tree?.root;
			});
		});

		function hover(e: MouseEvent) {
			const { project } = props.tree!.pluginContext;
			const detecting = toRaw(project).currentDocument?.detecting;
			if (detecting?.enable) {
				return;
			}
			const node = getTreeNodeFromEvent(e)?.node;
			node?.id && detecting?.capture(node.id);
		}

		function onMouseOver(e: MouseEvent) {
			hover(e);
		}

		const onMouseLeave = () => {
			const { project } = props.tree!.pluginContext;
			const doc = toRaw(project).currentDocument;
			doc?.detecting.leave();
		};

		function onClick(e: MouseEvent) {
			if (ignoreUpSelected.value) {
				boostEvent = undefined;
				return;
			}
			if (boostEvent && isShaken(boostEvent, e)) {
				boostEvent = undefined;
				return;
			}
			boostEvent = undefined;
			const treeNode = getTreeNodeFromEvent(e);
			if (!treeNode) {
				return;
			}
			const node = toRaw(treeNode.node);
			if (!canClickNode(node, e)) {
				return;
			}

			const { project, event } = props.tree!.pluginContext;
			const doc = toRaw(project)?.currentDocument;
			const selection = doc?.selection;
			const focusNode = doc?.focusNode;
			const { id } = node;
			const isMulti = e.metaKey || e.ctrlKey || e.shiftKey;
			// toRaw(canvas).activeTracker?.track(node);

			if (
				isMulti &&
				focusNode &&
				!node.contains(focusNode) &&
				selection?.has(id)
			) {
				if (!isFormEvent(e)) {
					selection.remove(id);
				}
			} else {
				selection?.select(id);
				const selectedNode = selection?.getNodes()?.[0];
				const npm = selectedNode?.componentMeta?.npm;
				const selected =
					[npm?.package, npm?.componentName]
						.filter((item) => !!item)
						.join('-') ||
					selectedNode?.componentMeta?.componentName ||
					'';
				event.emit('layersPane.select', {
					selected,
				});
			}
		}

		const onDoubleClick = (e: MouseEvent) => {
			e.preventDefault();
			const treeNode = getTreeNodeFromEvent(e);
			if (treeNode?.nodeId === root.value?.nodeId) {
				return;
			}
			if (!treeNode?.expanded) {
				props.tree?.expandAllDecendants(treeNode);
			} else {
				props.tree?.collapseAllDecendants(treeNode);
			}
		};

		function getTreeNodeFromEvent(e: MouseEvent) {
			if (!shell.value) {
				return;
			}
			const id = getTreeNodeIdByEvent(e, shell.value);
			if (!id) {
				return;
			}
			const { tree } = props;
			return toRaw(tree?.getTreeNodeById(id));
		}

		function onMouseDown(e: MouseEvent) {
			if (isFormEvent(e)) {
				return;
			}
			const treeNode = getTreeNodeFromEvent(e);
			if (!treeNode) {
				return;
			}
			const node = toRaw(treeNode.node);
			if (!canClickNode(node, e)) {
				return;
			}
			const { project, canvas } = props.tree!.pluginContext;
			const selection = toRaw(project).currentDocument?.selection;
			const focusNode = toRaw(project).currentDocument?.focusNode;

			// TODO: shift selection
			const isMulti = e.metaKey || e.ctrlKey || e.shiftKey;

			const isLeftButton = e.button === 0;
			if (isLeftButton && focusNode && !node.contains(focusNode)) {
				let nodes: IPublicModelNode[] = [node];
				ignoreUpSelected.value = false;
				if (isMulti) {
					if (!selection?.has(node.id)) {
						// TODO toRaw(canvas).activeTracker?.track(node);
						selection?.add(node.id);
						ignoreUpSelected.value = true;
					}
					// todo: remove rootNodes id
					selection?.remove(focusNode.id);
					// 获得顶层 nodes
					if (selection) {
						nodes = selection.getTopNodes();
					}
				} else if (selection?.has(node.id)) {
					nodes = selection.getTopNodes();
				}
				toRaw(canvas).dragon?.boost(
					{
						type: IPublicEnumDragObjectType.Node,
						nodes,
					},
					e
				);
			}
		}

		return () => {
			if (!root.value) {
				return null;
			}

			return (
				<div
					ref={shell}
					class="mtc-layers-tree"
					onClick={onClick}
					onMousedownCapture={onMouseDown}
					onMouseover={onMouseOver}
					onMouseleave={onMouseLeave}
					onDblclick={onDoubleClick}
				>
					<TreeNodeView
						key={root.value.id}
						treeNode={toRaw(root.value)}
						isRootNode
					/>
				</div>
			);
		};
	},
});

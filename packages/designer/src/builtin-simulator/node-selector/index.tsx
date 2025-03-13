import { defineComponent, onMounted, PropType, ref, toRaw } from 'vue';
import { Title } from '@arvin-shu/microcode-editor-core';
import { canClickNode } from '@arvin-shu/microcode-utils';
import { Tooltip } from 'ant-design-vue';
import { INode } from '../../document';

type UnionNode = INode | null;

// TODO 未实现
export const InstanceNodeSelector = defineComponent({
	props: {
		node: {
			type: Object as PropType<INode>,
			require: true,
		},
	},
	setup(props) {
		const parentNodes = ref<INode[]>([]);
		onMounted(() => {
			parentNodes.value = getParentNodes(props.node!) as INode[];
		});

		// 获取节点的父级节点（最多获取 5 层）
		const getParentNodes = (node: INode) => {
			const parentNodes: any[] = [];
			const focusNode = node.document?.focusNode;

			if (!focusNode) {
				return null;
			}

			if (node.contains(focusNode) || !focusNode.contains(node)) {
				return parentNodes;
			}

			let currentNode: UnionNode = node;

			while (currentNode && parentNodes.length < 5) {
				currentNode = currentNode.getParent();
				if (currentNode) {
					parentNodes.push(currentNode);
				}
				if (currentNode === focusNode) {
					break;
				}
			}
			return parentNodes;
		};

		const onSelect = (node: INode) => (event: MouseEvent) => {
			if (!node) {
				return;
			}

			const canClick = canClickNode(node.internalToShellNode()!, event);

			if (canClick && typeof node.select === 'function') {
				node.select();
				const editor = node.document?.designer.editor;
				const npm = node?.componentMeta?.npm;
				const selected =
					[npm?.package, npm?.componentName]
						.filter((item) => !!item)
						.join('-') ||
					node?.componentMeta?.componentName ||
					'';
				editor?.eventBus.emit('designer.border.action', {
					name: 'select',
					selected,
				});
			}
		};

		const onMouseOver =
			(node: INode) =>
			(_: any, flag = true) => {
				if (node && typeof node.hover === 'function') {
					node.hover(flag);
				}
			};

		const onMouseOut =
			(node: INode) =>
			(_: any, flag = false) => {
				if (node && typeof node.hover === 'function') {
					node.hover(flag);
				}
			};

		function renderNodes() {
			const nodes = toRaw(parentNodes.value) as any;
			if (!nodes || nodes.length < 1) {
				return null;
			}
			const children = nodes.map((node: any, key: number) => (
				<div
					key={key}
					onClick={onSelect(node)}
					onMouseEnter={onMouseOver(node)}
					onMouseLeave={onMouseOut(node)}
					class="instance-node-selector-node"
				>
					<div class="instance-node-selector-node-content">
						<Title
							class="instance-node-selector-node-title"
							title={{
								label: node.title,
								icon: node.icon,
							}}
						/>
					</div>
				</div>
			));
			return children;
		}

		return () => {
			const selectedNode = (
				<div class="instance-node-selector-current">
					<Title
						class="instance-node-selector-node-title"
						title={{
							label: toRaw(props.node)?.title,
							icon: toRaw(props.node)?.icon,
						}}
					/>
				</div>
			);

			return (
				<div class="instance-node-selector">
					{props.node?.isRoot() ? (
						selectedNode
					) : (
						<Tooltip
							overlayStyle={{ marginTop: '-4px' }}
							overlayInnerStyle={{ padding: '3px 2px' }}
							arrow={false}
							placement="bottom"
							destroyTooltipOnHide
						>
							{{
								title: () => renderNodes(),
								default: () => selectedNode,
							}}
						</Tooltip>
					)}
				</div>
			);
		};
	},
});

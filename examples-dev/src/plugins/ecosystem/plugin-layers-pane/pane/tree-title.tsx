import { defineComponent, PropType, ref, Fragment, onMounted } from 'vue';
import { createIcon } from '@arvin-shu/microcode-utils';
import { Tip, Title } from '@arvin-shu/microcode-editor-core';
import { IPublicApiEvent } from '@arvin-shu/microcode-types';
import { TreeNode } from '../model/tree-node';
import { intl, intlNode } from '../locale';
import {
	ArrowIcon,
	CloseEyeIcon,
	ConditionIcon,
	DeleteIcon,
	EyeIcon,
	LockIcon,
	LoopIcon,
	RadioActiveIcon,
	RadioIcon,
	RenameIcon,
	UnLockIcon,
} from '../icons';

export const TreeTitle = defineComponent({
	name: 'TreeTitle',
	inheritAttrs: false,
	props: {
		treeNode: {
			type: Object as PropType<TreeNode>,
			required: true,
		},
		isModal: {
			type: Boolean,
			default: false,
		},
		hidden: Boolean,
		locked: Boolean,
		expandable: Boolean,
		expanded: Boolean,
	},
	setup(props) {
		const title = ref(props.treeNode?.titleLabel || '');

		let lastInput: HTMLInputElement | null = null;

		const editing = ref(false);

		const condition = ref(props.treeNode?.condition);

		const visible = ref(props.treeNode?.hidden);

		function cancelEdit() {
			editing.value = false;
			lastInput = null;
		}

		function handleDelete() {
			const { treeNode } = props;
			const { node } = treeNode;
			treeNode.deleteNode(node);
		}

		function handleEdit(e: MouseEvent) {
			e.preventDefault();
			editing.value = true;
		}

		function saveEdit(e: any) {
			editing.value = false;
			const value = (e.target as HTMLInputElement).value;
			props.treeNode.setTitleLabel(value);
			emitOutlineEvent(
				props.treeNode.pluginContext.event,
				'rename',
				props.treeNode,
				{ value }
			);
			cancelEdit();
		}

		function setCaret(input: HTMLInputElement | null) {
			if (!input || lastInput === input) {
				return;
			}
			input.focus();
			input.select();
		}

		function handleKeyUp(e: any) {
			if (e.keyCode === 13) {
				saveEdit(e);
			}
			if (e.keyCode === 27) {
				cancelEdit();
			}
		}

		onMounted(() => {
			const { treeNode } = props;
			editing.value = false;
			title.value = treeNode?.titleLabel || '';
			condition.value = treeNode?.condition;
			visible.value = !treeNode?.hidden;
			treeNode.onTitleLabelChanged(() => {
				title.value = treeNode?.titleLabel || '';
			});
			treeNode.onConditionChanged(() => {
				condition.value = treeNode?.condition;
			});
			treeNode.onHiddenChanged((hidden: boolean) => {
				visible.value = !hidden;
			});
		});

		return () => {
			const { treeNode, isModal } = props;

			const isCNode = !treeNode.isRoot();

			const isNodeParent = treeNode.node.isParentalNode;

			const { node, pluginContext } = treeNode;
			const { componentMeta } = node;

			const isContainer = node.isContainerNode;
			let style: any;

			if (isCNode) {
				const { depth } = treeNode;
				const indent = depth * 12;
				style = {
					paddingLeft: `${indent + (isModal ? 12 : 0)}px`,
					marginLeft: `${-indent}px`,
				};
			}
			const availableActions = componentMeta
				? componentMeta.availableActions.map(
						(availableAction) => availableAction.name
					)
				: [];

			const couldHide = availableActions.includes('hide');
			const couldLock = availableActions.includes('lock');
			const couldUnlock = availableActions.includes('unlock');
			const shouldShowHideBtn =
				isCNode && isNodeParent && !isModal && couldHide;

			const shouldShowLockBtn =
				pluginContext.config.get('enableCanvasLock', false) &&
				isContainer &&
				isCNode &&
				isNodeParent &&
				((couldLock && !node.isLocked) || (couldUnlock && node.isLocked));

			const shouldEditBtn = isCNode && isNodeParent;

			const shouldDeleteBtn =
				isCNode && isNodeParent && node?.canPerformAction('remove');

			const Extra = pluginContext.extraTitle;

			return (
				<div
					class={{
						'mtc-tree-node-title': true,
						editing: editing.value,
					}}
					data-id={treeNode.nodeId}
					style={style}
					onClick={() => {
						if (isModal) {
							if (visible.value) {
								node.document?.modalNodesManager?.setInvisible(node);
							} else {
								node.document?.modalNodesManager?.setVisible(node);
							}
							return;
						}
						if (node.conditionGroup) {
							node.setConditionalVisible();
						}
					}}
				>
					{isModal && visible.value && (
						<div
							onClick={(e: MouseEvent) => {
								e.stopPropagation();
								node.document?.modalNodesManager?.setInvisible(node);
							}}
						>
							<RadioActiveIcon class="mtc-tree-node-modal-radio-active" />
						</div>
					)}
					{isModal && !visible.value && (
						<div
							onClick={(e: MouseEvent) => {
								e.stopPropagation();
								node.document?.modalNodesManager?.setVisible(node);
							}}
						>
							<RadioIcon class="mtc-tree-node-modal-radio" />
						</div>
					)}
					{isCNode && (
						<ExpandBtn
							expandable={props.expandable}
							expanded={props.expanded}
							treeNode={treeNode}
						/>
					)}
					<div class="mtc-tree-node-icon">{createIcon(treeNode.icon)}</div>
					<div class="mtc-tree-node-title-label">
						{editing.value ? (
							<input
								defaultValue={title.value}
								onBlur={saveEdit}
								class="mtc-tree-node-title-input"
								ref={(el: any) => {
									setCaret(el);
								}}
								onKeyUp={handleKeyUp}
							></input>
						) : (
							<Fragment>
								<Title title={title.value}></Title>
								{Extra && <Extra node={treeNode?.node} />}
								{node.slotFor && (
									<a class="mtc-tree-node-tag slot">
										<Tip>
											{intlNode('Slot for {prop}', { prop: node.slotFor.key })}
										</Tip>
									</a>
								)}
								{node.hasLoop() && (
									<a class="mtc-tree-node-tag loop">
										<LoopIcon />
										<Tip>{intlNode('Loop')}</Tip>
									</a>
								)}
								{condition.value && (
									<a class="mtc-tree-node-tag cond">
										<ConditionIcon />
										<Tip>{intlNode('Conditional')}</Tip>
									</a>
								)}
							</Fragment>
						)}
					</div>
					{shouldShowHideBtn && (
						<HideBtn hidden={props.hidden} treeNode={treeNode}></HideBtn>
					)}
					{shouldShowLockBtn && (
						<LockBtn locked={props.locked} treeNode={treeNode}></LockBtn>
					)}
					{shouldEditBtn && <RenameBtn onClick={handleEdit}></RenameBtn>}
					{shouldDeleteBtn && <DeleteBtn onClick={handleDelete}></DeleteBtn>}
				</div>
			);
		};
	},
});

export const DeleteBtn = defineComponent({
	name: 'DeleteBtn',
	setup() {
		return () => (
			<div className="mtc-tree-node-delete-btn">
				<DeleteIcon />
				<Tip>{intl('Delete')}</Tip>
			</div>
		);
	},
});

export const RenameBtn = defineComponent({
	name: 'RenameBtn',
	setup() {
		return () => (
			<div className="mtc-tree-node-rename-btn">
				<RenameIcon />
				<Tip>{intl('Rename')}</Tip>
			</div>
		);
	},
});

export const LockBtn = defineComponent({
	name: 'LockBtn',
	inheritAttrs: false,
	props: {
		locked: Boolean,
		treeNode: {
			type: Object as PropType<TreeNode>,
		},
	},
	setup(props) {
		return () => {
			const { locked, treeNode } = props;
			return (
				<div
					className="mtc-tree-node-lock-btn"
					onClick={(e: MouseEvent) => {
						e.stopPropagation();
						treeNode?.setLocked(!props.locked);
					}}
				>
					{props.locked ? <UnLockIcon /> : <LockIcon />}
					<Tip>{locked ? intl('Unlock') : intl('Lock')}</Tip>
				</div>
			);
		};
	},
});

export const HideBtn = defineComponent({
	name: 'HideBtn',
	props: {
		hidden: Boolean,
		treeNode: {
			type: Object as PropType<TreeNode>,
		},
	},
	inheritAttrs: false,
	setup(props) {
		return () => {
			const { hidden, treeNode } = props;

			return (
				<div
					class="mtc-tree-node-hide-btn"
					onClick={(e: MouseEvent) => {
						e.stopPropagation();
						emitOutlineEvent(
							treeNode?.pluginContext.event,
							hidden ? 'show' : 'hide',
							treeNode!
						);
						treeNode?.setHidden(!props.hidden);
					}}
				>
					{hidden ? <EyeIcon /> : <CloseEyeIcon />}
					<Tip children={hidden ? intl('Show') : intl('Hide')}></Tip>
				</div>
			);
		};
	},
});

export const ExpandBtn = defineComponent({
	name: 'ExpandBtn',
	props: {
		expanded: Boolean,
		expandable: Boolean,
		treeNode: {
			type: Object as PropType<TreeNode>,
		},
	},
	setup(props) {
		return () => {
			const { treeNode, expanded, expandable } = props;

			if (!expandable) {
				return <i class="mtc-tree-node-expand-placeholder" />;
			}

			return (
				<div
					class="mtc-tree-node-expand-btn"
					onClick={(e: any) => {
						if (expanded) {
							e.stopPropagation();
						}
						emitOutlineEvent(
							treeNode?.pluginContext.event,
							expanded ? 'collapse' : 'expand',
							treeNode!
						);
						treeNode?.setExpanded(!expanded);
					}}
				>
					<ArrowIcon />
				</div>
			);
		};
	},
});

function emitOutlineEvent(
	event: IPublicApiEvent | undefined,
	type: string,
	treeNode: TreeNode,
	rest?: Record<string, unknown>
) {
	const node = treeNode?.node;
	const npm = node?.componentMeta?.npm;
	const selected =
		[npm?.package, npm?.componentName].filter((item) => !!item).join('-') ||
		node?.componentMeta?.componentName ||
		'';
	event?.emit(`layersPane.${type}`, {
		selected,
		...rest,
	});
}

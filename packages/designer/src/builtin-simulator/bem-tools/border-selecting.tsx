import {
	defineComponent,
	PropType,
	computed,
	toRaw,
	onBeforeUnmount,
	isVNode,
	cloneVNode,
	h,
	VNode,
} from 'vue';
import { engineConfig, Tip } from '@arvin-shu/microcode-editor-core';
import {
	createIcon,
	isActionContentObject,
	isVueComponent,
} from '@arvin-shu/microcode-utils';
import { BuiltinSimulatorHost } from '../host';
import { INode } from '../../document';
import { OffsetObserver } from '../../designer/offset-observer';

export const BorderSelectingInstance = defineComponent({
	name: 'BorderSelectingInstance',
	props: {
		observed: {
			type: Object as PropType<OffsetObserver>,
			require: true,
		},
		dragging: Boolean,
		highlight: Boolean,
	},
	setup(props) {
		onBeforeUnmount(() => {
			props.observed?.purge();
		});

		const { observed, highlight, dragging } = props;

		const className = computed(() => [
			'mtc-borders',
			'mtc-borders-selecting',
			{ highlight, dragging },
		]);

		const style = computed(() => ({
			width: `${observed?.offsetWidth}px`,
			height: `${observed?.offsetHeight}px`,
			transform: `translate3d(${observed?.offsetLeft}px, ${observed?.offsetTop}px, 0)`,
		}));

		return () => {
			const { observed } = props;
			if (!observed?.hasOffset.value) {
				return <></>;
			}

			const hideComponentAction = engineConfig.get('hideComponentAction');

			return (
				<div class={className.value} style={style.value}>
					{!dragging && !hideComponentAction ? (
						<Toolbar observed={observed} />
					) : null}
				</div>
			);
		};
	},
});

export const Toolbar = defineComponent({
	name: 'Toolbar',
	inheritAttrs: false,
	props: {
		observed: {
			type: Object as PropType<OffsetObserver>,
		},
	},
	setup(props) {
		return () => {
			const observed = props.observed!;
			const { height, width } = observed.viewport;

			const BAR_HEIGHT = 20;
			const MARGIN = 1;
			const BORDER = 2;
			const SPACE_HEIGHT = BAR_HEIGHT + MARGIN + BORDER;
			const SPACE_MINIMUM_WIDTH = 160; // magic number，大致是 toolbar 的宽度
			let style: any;
			// 计算 toolbar 的上/下位置
			if (observed.top > SPACE_HEIGHT) {
				style = {
					top: `-${SPACE_HEIGHT}px`,
					height: `${BAR_HEIGHT}px`,
				};
			} else if (observed.bottom + SPACE_HEIGHT < height) {
				style = {
					bottom: `-${SPACE_HEIGHT}px`,
					height: `${BAR_HEIGHT}px`,
				};
			} else {
				style = {
					height: `${BAR_HEIGHT}px`,
					top: `${Math.max(MARGIN, MARGIN - observed.top)}px`,
				};
			}

			// 计算 toolbar 的左/右位置
			if (SPACE_MINIMUM_WIDTH > observed.left + observed.width) {
				style.left = `${Math.max(-BORDER, observed.left - width - BORDER)}px`;
			} else {
				style.right = `${Math.max(-BORDER, observed.right - width - BORDER)}px`;
				style.justifyContent = 'flex-start';
			}
			const actions: VNode[] = [];

			const { node } = observed;

			toRaw(node.componentMeta).availableActions.forEach((action) => {
				const { content, name } = action;

				actions.push(createAction(content, name, node));
			});

			return (
				<div class="mtc-borders-actions" style={style}>
					{...actions}
				</div>
			);
		};
	},
});

function createAction(content: any, key: string, node: INode) {
	// 处理 VNode
	if (isVNode(content)) {
		return cloneVNode(content, { key, node });
	}

	// 处理 Vue 组件
	if (isVueComponent(content)) {
		return h(content, { key, node });
	}

	if (isActionContentObject(content)) {
		const { action, title, icon } = content;

		return (
			<div
				key={key}
				class="mtc-borders-action"
				onClick={() => {
					action && action(node.internalToShellNode()!);
					const editor = node.document?.designer.editor;
					const npm = node?.componentMeta?.npm;
					const selected =
						[npm?.package, npm?.componentName]
							.filter((item) => !!item)
							.join('-') ||
						node?.componentMeta?.componentName ||
						'';
					editor?.eventBus.emit('designer.border.action', {
						name: key,
						selected,
					});
				}}
			>
				{icon && createIcon(icon, { key, node: node.internalToShellNode() })}
				<Tip children={title as any}></Tip>
			</div>
		);
	}
	return null;
}

export const BorderSelectingForNode = defineComponent({
	name: 'BorderSelectingForNode',
	props: {
		node: {
			type: Object as PropType<INode>,
			require: true,
		},
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	setup(props) {
		const { node, host } = props;
		const observedMap = new Map();

		const instances = computed(() => host?.getComponentInstances(node!));

		onBeforeUnmount(() => {
			observedMap.forEach((observed) => {
				observed.purge();
			});
			observedMap.clear();
		});

		return () => {
			if (!instances.value || instances.value.length < 1) {
				return <></>;
			}

			return (
				<>
					{instances.value.map((instance) => {
						const instanceKey = toRaw(instance);

						// TODO 滚动需要优化

						if (host?.viewport.scrolling) {
							// 滚动时使用缓存的observed
							const cachedObserved = observedMap.get(instanceKey);
							if (cachedObserved) {
								return (
									<BorderSelectingInstance
										key={cachedObserved.id}
										dragging={host?.designer.dragon.dragging}
										observed={cachedObserved}
									/>
								);
							}
							return;
						}

						const observed = host?.designer.createOffsetObserver({
							node: node!,
							instance: instanceKey,
						});

						if (!observed) {
							return <></>;
						}
						// 缓存observed用于滚动时使用
						observedMap.set(instanceKey, observed);
						return (
							<BorderSelectingInstance
								key={observed.id}
								dragging={host?.designer.dragon.dragging}
								observed={observed}
							/>
						);
					})}
				</>
			);
		};
	},
});

export const BorderSelecting = defineComponent({
	name: 'BorderSelecting',
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	setup(props) {
		const { host } = props;

		const selecting = computed(() => {
			const doc = host?.currentDocument;
			//  TODO host.liveEditing.editing
			if (!doc || doc.suspensed) {
				return null;
			}
			const s = doc.selection;
			return host.designer.dragon.dragging ? s.getTopNodes() : s.getNodes();
		});

		return () => {
			if (!selecting.value || selecting.value.length < 1) {
				return <></>;
			}
			return (
				<>
					{selecting.value.map((node) => (
						<BorderSelectingForNode key={node.id} node={node} host={host} />
					))}
				</>
			);
		};
	},
});

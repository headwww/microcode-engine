import { Title } from '@arvin-shu/microcode-editor-core';
import { IPublicTypeTitleContent } from '@arvin-shu/microcode-types';
import { computed, defineComponent, PropType, toRaw } from 'vue';
import { getClosestNode } from '@arvin-shu/microcode-utils';
import { intl } from '../../locale';
import { BuiltinSimulatorHost } from '../host';
import { INode } from '../../document';

export const BorderDetectingInstance = defineComponent({
	props: {
		title: {
			type: [String, Object] as PropType<IPublicTypeTitleContent>,
			require: true,
		},
		rect: {
			type: Object as PropType<DOMRect | null>,
			require: true,
		},
		scale: {
			type: Number,
			require: true,
		},
		scrollX: {
			type: Number,
			require: true,
		},
		scrollY: {
			type: Number,
			require: true,
		},
		isLocked: {
			type: Boolean,
		},
	},
	setup(props) {
		return () => {
			const { title, rect, scale, scrollX, scrollY, isLocked } = props;
			if (!rect) {
				return <></>;
			}

			const style = {
				width: `${rect.width * scale!}px`,
				height: `${rect.height * scale!}px`,
				transform: `translate(${(scrollX! + rect.left) * scale!}px, ${(scrollY! + rect.top) * scale!}px)`,
			};

			return (
				<div class="mtc-borders mtc-borders-detecting" style={style}>
					<Title title={title} className="mtc-borders-title" />
					{isLocked ? (
						<Title title={intl('locked')} className="mtc-borders-status" />
					) : null}
				</div>
			);
		};
	},
});

export const BorderDetecting = defineComponent({
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	setup(props) {
		const scale = computed(() => props.host!.viewport.scale);
		const scrollX = computed(() => props.host!.viewport.scrollX);
		const scrollY = computed(() => props.host!.viewport.scrollY);

		const current = computed((): INode | null => {
			const { host } = props;

			if (!host) {
				return null;
			}
			const doc = host.currentDocument;
			if (!doc) {
				return null;
			}

			const { selection } = doc;
			const cur = host.designer.detecting.current;

			if (!cur || toRaw(cur.document) !== doc || selection.has(cur.id)) {
				return null;
			}
			return cur;
		});

		return () => {
			const { host } = props;

			const canHoverHook =
				current.value?.componentMeta?.advanced?.callbacks?.onHoverHook;
			const canHover =
				canHoverHook && typeof canHoverHook === 'function'
					? canHoverHook(current.value.internalToShellNode() as any)
					: true;

			// TODO props.host.liveEditing
			// 以下情况不显示边框:
			// 1. 当前节点不允许hover (canHover为false)
			// 2. 没有当前节点 (current为null)
			// 3. 视口正在滚动 (scrolling为true)
			// 4. 正在进行实时编辑 (editing为true)
			if (!canHover || !current.value || host?.viewport.scrolling) {
				return <></>;
			}

			const focusNode = toRaw(current.value.document?.focusNode!);

			if (!focusNode.contains(toRaw(current.value))) {
				return null;
			}

			if (toRaw(current.value)?.contains(focusNode)) {
				const { bounds } = props.host!.viewport;
				return (
					<BorderDetectingInstance
						key="line-root"
						title={current.value.title}
						scale={scale.value}
						scrollX={host?.viewport.scrollX}
						scrollY={host?.viewport.scrollY}
						rect={new DOMRect(0, 0, bounds.width, bounds.height)}
					/>
				);
			}

			const lockedNode = getClosestNode(
				toRaw(current.value) as any,
				(n) =>
					// 假如当前节点就是 locked 状态，要从当前节点的父节点开始查找
					!!(toRaw(current.value)?.isLocked ? n.parent?.isLocked : n.isLocked)
			);

			if (lockedNode && lockedNode.getId() !== current.value.getId()) {
				// 选中父节锁定的节点
				return (
					<BorderDetectingInstance
						key="line-h"
						title={current.value.title}
						scale={scale.value}
						scrollX={scrollX.value}
						scrollY={scrollY.value}
						rect={host?.computeComponentInstanceRect(
							// @ts-ignore
							host.getComponentInstances(lockedNode)[0],
							lockedNode.componentMeta.rootSelector
						)}
						isLocked={lockedNode?.getId() !== toRaw(current.value).getId()}
					/>
				);
			}

			const instances = props.host?.getComponentInstances(current.value as any);
			if (!instances || instances.length < 1) {
				return <></>;
			}
			if (instances.length === 1) {
				return (
					<BorderDetectingInstance
						key="line-h"
						title={toRaw(current.value).title}
						scale={scale.value}
						scrollX={scrollX.value}
						scrollY={scrollY.value}
						rect={props.host?.computeComponentInstanceRect(
							instances[0],
							toRaw(current.value).componentMeta.rootSelector
						)}
					></BorderDetectingInstance>
				);
			}
			return (
				<>
					{instances.map((inst, i) => (
						<BorderDetectingInstance
							key={`line-h-${i}`}
							title={toRaw(current.value)?.title}
							scale={scale.value}
							scrollX={scrollX.value}
							scrollY={scrollY.value}
							rect={props.host?.computeComponentInstanceRect(
								inst,
								toRaw(current.value)?.componentMeta.rootSelector
							)}
						/>
					))}
				</>
			);
		};
	},
});

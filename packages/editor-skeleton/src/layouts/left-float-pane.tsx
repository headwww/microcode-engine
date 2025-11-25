import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	onUpdated,
	PropType,
	ref,
	toRaw,
} from 'vue';
import {
	IPublicApiProject,
	IPublicTypePanelConfig,
} from '@arvin-shu/microcode-types';
import { Focusable } from '@arvin-shu/microcode-editor-core';
import { toPx } from '@arvin-shu/microcode-utils';
import { Area } from '../area';
import { Panel } from '..';

export const LeftFloatPane = defineComponent({
	name: 'LeftFloatPane',
	props: {
		area: Object as PropType<Area<IPublicTypePanelConfig, Panel>>,
	},
	setup(props) {
		let focusing: Focusable;

		const shell = ref<HTMLDivElement>();

		let dispose: () => void;

		onMounted(() => {
			if (props.area) {
				const triggerClose = (e: any) => {
					if (!props.area?.visible) return;
					// 当 MouseEvent 的 target 为「插入占位符」时，不关闭当前 panel
					if (e.originalEvent?.target?.classList.contains('insertion')) return;
					// 假如当前操作 target 祖先节点中有属性 data-keep-visible-while-dragging="true" 代表该 target 所属 panel
					// 不希望 target 在 panel 范围内拖拽时关闭 panel
					const panelElem = e.originalEvent?.target.closest(
						'div[data-keep-visible-while-dragging="true"]'
					);
					if (panelElem) return;
					props.area.setVisible(false);
				};

				props.area.skeleton.editor.eventBus.on('designer.drag', triggerClose);

				dispose = () => {
					props.area?.skeleton.editor.removeListener(
						'designer.drag',
						triggerClose
					);
				};

				const project: IPublicApiProject | undefined =
					props.area.skeleton.editor.get('project');

				focusing = props.area.skeleton.focusTracker.create({
					range: (e: MouseEvent) => {
						const target = e.target as HTMLElement;
						if (!target) {
							return false;
						}
						// 不失去焦点
						if (shell.value?.contains(target)) {
							return true;
						}
						// 点击了 iframe 内容，算失焦
						if (
							(
								document.querySelector(
									'.mtc-simulator-content-frame'
								) as HTMLIFrameElement
							)?.contentWindow?.document.documentElement.contains(target)
						) {
							return false;
						}
						if (target.classList.contains('mtc-simulator-content-frame')) {
							return false;
						}
						if (
							project?.simulatorHost?.contentWindow?.document.documentElement.contains(
								target
							)
						) {
							return false;
						}
						// 点击设置区
						if (document.querySelector('.mtc-right-area')?.contains(target)) {
							return false;
						}
						// 点击非编辑区域的popup/dialog,插件栏左侧等不触发失焦
						if (!document.querySelector('.mtc-workbench')?.contains(target)) {
							return true;
						}
						// 排除设置区，iframe 之后，都不算失焦
						if (
							document.querySelector('.mtc-workbench-body')?.contains(target)
						) {
							return true;
						}
						// 在非left区域及获得panel激活后再次点击也需要失去焦点隐藏
						const docks = toRaw(props.area?.current.value)?.getAssocDocks();
						if (docks && docks?.length) {
							return docks.some((dock: any) =>
								dock.getDOMNode().el.contains(target)
							);
						}
						return false;
					},
					onEsc: () => {
						props.area?.setVisible(false);
					},
					onBlur: () => {
						props.area?.setVisible(false);
					},
				});

				onEffect();
			}
		});

		onUpdated(() => {
			onEffect();
		});

		function onEffect() {
			const { area } = props;
			if (area) {
				if (area.visible.value) {
					focusing?.active();
				} else {
					focusing?.suspense();
				}
			}
		}

		onBeforeUnmount(() => {
			focusing?.purge();
			dispose?.();
		});

		return () => {
			const width = props.area?.current.value?.config.props?.width;

			const style = width
				? {
						width: toPx(width),
					}
				: undefined;

			return (
				<div
					ref={shell}
					class={{
						'mtc-left-float-pane': true,
						'mtc-area-visible': props.area?.visible.value,
					}}
					style={style}
				>
					{props.area?.container.items.map((panel) => panel.content)}
				</div>
			);
		};
	},
});

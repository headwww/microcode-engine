import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	onUpdated,
	PropType,
	ref,
	toRaw,
} from 'vue';
import { IPublicTypePanelConfig } from '@arvin/microcode-types';
import { Focusable } from '@arvin/microcode-editor-core';
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
		onMounted(() => {
			const { area } = props;
			if (area) {
				focusing = area.skeleton.focusTracker.create({
					range: (e: MouseEvent) => {
						const target = e.target as HTMLElement;
						if (!target) {
							return false;
						}
						// 不失去焦点
						if (shell.value?.contains(target)) {
							return true;
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
						const docks = toRaw(area.current.value)?.getAssocDocks();
						if (docks && docks?.length) {
							return docks.some((dock: any) =>
								dock.getDOMNode().el.contains(target)
							);
						}
						return false;
					},
					onEsc: () => {
						area.setVisible(false);
					},
					onBlur: () => {
						area.setVisible(false);
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
		});

		return () => {
			const { area } = props;
			const width = area?.current.value?.config.props?.width;

			const style = width
				? {
						width,
					}
				: undefined;

			return (
				<div
					ref={shell}
					class={{
						'mtc-left-float-pane': true,
						'mtc-area-visible': area?.visible.value,
					}}
					style={style}
				>
					{area?.container.items.value.map((panel) => panel.content)}
				</div>
			);
		};
	},
});

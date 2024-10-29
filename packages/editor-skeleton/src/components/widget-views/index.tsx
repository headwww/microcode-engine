import { defineComponent, onMounted, onUpdated, PropType, ref } from 'vue';
import { Title } from '@arvin/microcode-editor-core';
import { SkeletonEvents } from '../../skeleton';
import { composeTitle, IWidget, Panel, PanelDock } from '../../widget';
import { DockProps } from '../../types';

export function DockView(props: DockProps) {
	const { title, onClick, className, size, description, icon } = props;
	return (
		<Title
			title={composeTitle(title, icon, description)}
			class={{
				'mtc-dock': true,
				[className || '']: !!className,
				[`mtc-dock-${size}`]: size,
			}}
			onClick={onClick}
		></Title>
	);
}

export const PanelDockView = defineComponent({
	name: 'PanelDockView',
	props: {
		dockProps: Object as PropType<DockProps & { dock: PanelDock }>,
	},
	setup(props) {
		onMounted(() => {
			checkActived();
		});

		onUpdated(() => {
			checkActived();
		});

		const lastActived = ref(false);

		function checkActived() {
			if (props.dockProps) {
				const { dock } = props.dockProps;
				if (dock.actived.value !== lastActived.value) {
					lastActived.value = dock.actived.value;
					if (lastActived.value) {
						dock.skeleton.postEvent(
							SkeletonEvents.PANEL_DOCK_ACTIVE,
							dock.name,
							dock
						);
					} else {
						dock.skeleton.postEvent(
							SkeletonEvents.PANEL_DOCK_UNACTIVE,
							dock.name,
							dock
						);
					}
				}
			}
		}

		return () => {
			const { dock, className, onClick, ...dockProps } = props.dockProps!;
			const classes = [className];

			if (dock.actived.value) {
				classes.push('actived');
			}
			return DockView({
				...dockProps,
				className: classes.join(' '),
				onClick: () => {
					onClick && onClick();
					dock.togglePanel();
				},
			});
		};
	},
});

export const TitledPanelView = defineComponent({
	name: 'TitledPanelView',
	props: {
		panel: Object as PropType<Panel>,
		area: String,
	},
	setup(props) {
		return () => {
			const { panel, area } = props;

			if (!props.panel?.inited.value) {
				return <></>;
			}
			const panelName = area ? `${area}-${panel?.name}` : panel?.name;

			return (
				<div
					id={panelName}
					class={{
						'mtc-titled-panel': true,
						hidden: !panel?.visible.value,
					}}
				>
					{props.panel?.body}
				</div>
			);
		};
	},
});

export const WidgetView = defineComponent({
	name: 'WidgetView',
	props: {
		widget: Object as PropType<IWidget>,
	},
	setup(props) {
		onMounted(() => {});

		onUpdated(() => {});

		return () => {
			const { widget } = props;
			if (!widget?.visible.value) {
				return null;
			}
			if (widget.disabled) {
				return <div class="mtc-widget-disabled">{widget.body}</div>;
			}
			return widget.body;
		};
	},
});

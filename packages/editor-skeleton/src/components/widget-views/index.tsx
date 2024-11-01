import { defineComponent, onMounted, onUpdated, PropType, ref } from 'vue';
import { HelpTip, Title } from '@arvin/microcode-editor-core';
import { SkeletonEvents } from '../../skeleton';
import { composeTitle, IWidget, Panel, PanelDock } from '../../widget';
import { DockProps } from '../../types';
import { PanelOperationRow } from './panel-operation-row';

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
		let lastVisible = false;

		onMounted(() => {
			checkVisible();
		});

		onUpdated(() => {
			checkVisible();
		});

		function checkVisible() {
			const { panel } = props;
			if (panel) {
				const currentVisible = panel.inited.value && panel.visible.value;
				if (currentVisible !== lastVisible) {
					lastVisible = currentVisible;
					if (lastVisible) {
						panel.skeleton.postEvent(
							SkeletonEvents.PANEL_SHOW,
							panel.name,
							panel
						);
					} else {
						panel.skeleton.postEvent(
							SkeletonEvents.PANEL_HIDE,
							panel.name,
							panel
						);
					}
				}
			}
		}
		return () => {
			const { panel, area } = props;

			if (!panel?.inited.value) {
				return <></>;
			}
			const panelName = area ? `${area}-${panel?.name}` : panel?.name;
			const editor = panel?.skeleton.editor;

			editor?.eventBus.emit('skeleton.panel.toggle', {
				name: panelName || '',
				status: panel.visible ? 'show' : 'hide',
			});

			return (
				<div
					id={panelName}
					class={{
						'mtc-titled-panel': true,
						hidden: !panel?.visible.value,
					}}
				>
					<PanelOperationRow panel={panel}></PanelOperationRow>
					<PanelTitle panel={panel}></PanelTitle>
					<div className="mtc-panel-body">{panel?.body}</div>
				</div>
			);
		};
	},
});

export const PanelView = defineComponent({
	name: 'PanelView',
	props: {
		panel: Object as PropType<Panel>,
		area: String,
		hideOperationRow: Boolean,
		hideDragLine: Boolean,
	},
	setup(props) {
		let lastVisible = false;

		onMounted(() => {
			checkVisible();
		});

		onUpdated(() => {
			checkVisible();
		});

		function checkVisible() {
			const { panel } = props;
			if (panel) {
				const currentVisible = panel.inited.value && panel.visible.value;
				if (currentVisible !== lastVisible) {
					lastVisible = currentVisible;
					if (lastVisible) {
						panel.skeleton.postEvent(
							SkeletonEvents.PANEL_SHOW,
							panel.name,
							panel
						);
					} else {
						panel.skeleton.postEvent(
							SkeletonEvents.PANEL_HIDE,
							panel.name,
							panel
						);
					}
				}
			}
		}

		return () => {
			const { panel, area, hideOperationRow } = props;
			if (!panel?.inited.value) {
				return <></>;
			}
			const editor = panel?.skeleton.editor;
			const panelName = area ? `${area}-${panel?.name}` : panel?.name;
			editor?.eventBus.emit('skeleton.panel.toggle', {
				name: panelName || '',
				status: panel.visible ? 'show' : 'hide',
			});

			return (
				<div
					id={panelName}
					class={{
						'mtc-panel': true,
						hidden: !panel?.visible.value,
					}}
				>
					{!hideOperationRow && <PanelOperationRow panel={panel} />}
					{panel.body}
				</div>
			);
		};
	},
});

export const PanelTitle = defineComponent({
	name: 'PanelTitle',
	props: {
		className: String,
		panel: Object as PropType<Panel>,
	},
	setup(props) {
		return () => {
			const { className, panel } = props;
			return (
				<div
					class={{
						'mtc-panel-title': true,
						[className || '']: !!className,
						actived: panel?.active,
					}}
					data-name={panel?.name}
				>
					<Title title={panel?.title || panel?.name}></Title>
					{panel?.help ? <HelpTip help={panel.help} /> : <></>}
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
		let lastVisible = false;
		let lastDisabled: boolean | undefined = false;

		onMounted(() => {
			checkVisible();
			checkDisabled();
		});

		onUpdated(() => {
			checkVisible();
			checkDisabled();
		});

		function checkVisible() {
			const { widget } = props;
			if (widget) {
				const currentVisible = widget.visible.value;
				if (currentVisible !== lastVisible) {
					lastVisible = currentVisible;
					if (lastVisible) {
						widget.skeleton.postEvent(
							SkeletonEvents.WIDGET_SHOW,
							widget.name,
							widget
						);
					} else {
						widget.skeleton.postEvent(
							SkeletonEvents.WIDGET_SHOW,
							widget.name,
							widget
						);
					}
				}
			}
		}

		function checkDisabled() {
			const { widget } = props;
			if (widget) {
				const currentDisabled = widget.disabled;
				if (currentDisabled !== lastDisabled) {
					lastDisabled = currentDisabled;
					if (lastDisabled) {
						widget.skeleton.postEvent(
							SkeletonEvents.WIDGET_DISABLE,
							widget.name,
							widget
						);
					} else {
						widget.skeleton.postEvent(
							SkeletonEvents.WIDGET_ENABLE,
							widget.name,
							widget
						);
					}
				}
			}
		}

		return () => {
			const { widget } = props;
			if (!widget?.visible.value) {
				return <></>;
			}
			if (widget.disabled) {
				return <div class="mtc-widget-disabled">{widget.body}</div>;
			}
			return <>{widget.body}</>;
		};
	},
});

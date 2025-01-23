import { computed, h, ref, VNode } from 'vue';
import { uniqueId } from '@arvin-shu/microcode-utils';
import { IWidget } from './widget';
import { PanelDockView, WidgetView } from '../components/widget-views';
import { PanelDockConfig } from '../types';
import { ISkeleton } from '../skeleton';
import { composeTitle } from './utils';
import { Panel } from './panel';

export class PanelDock implements IWidget {
	readonly isWidget = true;

	readonly isPanelDock = true;

	readonly id: string;

	readonly name: string;

	readonly align?: 'left' | 'right' | 'bottom' | 'center' | 'top' | undefined;

	private inited = false;

	private _body: VNode;

	get body() {
		if (this.inited) {
			return this._body;
		}
		this.inited = true;
		const { props } = this.config;

		this._body = h(PanelDockView, {
			dockProps: {
				...props,
				dock: this,
			},
		});

		return this._body;
	}

	private _shell = ref();

	get content(): VNode {
		return h(WidgetView, {
			widget: this,
			key: this.id,
			onVnodeMounted: (vnode) => {
				this._shell.value = vnode;
			},
		});
	}

	private _visible = ref(true);

	visible = computed(() => this._visible.value);

	actived = computed(() => this.panel.value?.visible.value || false);

	readonly panelName: string;

	private _panel?: Panel;

	private _disabled = ref(false);

	panel = computed(() => this._panel || this.skeleton.getPanel(this.panelName));

	constructor(
		readonly skeleton: ISkeleton,
		readonly config: PanelDockConfig
	) {
		const { content, name, props, panelProps, contentProps } = config;

		this.name = name;
		this.id = uniqueId(`dock:${name}$`);
		this.panelName = config.panelName || name;
		this.align = props?.align;
		if (content) {
			// 添加完PaneDock后如果设置了content则添加一个承载这个content的pane
			const _panelProps = { ...panelProps };
			if (_panelProps.title === null && props) {
				_panelProps.title = composeTitle(
					props.title,
					undefined,
					props.description,
					true,
					true
				);
			}
			this._panel = this.skeleton.add({
				type: 'Panel',
				name: this.panelName,
				props: _panelProps,
				contentProps,
				content,
				area: panelProps?.area,
			}) as Panel;
		}
		if (props?.onInit) {
			props.onInit.call(this, this);
		}
	}

	getDOMNode() {
		return this._shell.value;
	}

	setVisible(flag: boolean) {
		if (flag === this._visible.value) {
			return;
		}
		if (flag) {
			this._visible.value = true;
		} else if (this.inited) {
			this._visible.value = false;
		}
	}

	hide() {
		this.setVisible(false);
	}

	show() {
		this.setVisible(true);
	}

	toggle() {
		this.setVisible(!this._visible.value);
	}

	private setDisabled(flag: boolean) {
		if (this._disabled.value === flag) return;
		this._disabled.value = flag;
	}

	disable() {
		this.setDisabled(true);
	}

	enable() {
		this.setDisabled(false);
	}

	get disabled(): boolean {
		return this._disabled.value;
	}

	getName() {
		return this.name;
	}

	getContent() {
		return this.content;
	}

	hidePanel() {
		this.panel.value?.setActive(false);
	}

	showPanel() {
		this.panel.value?.setActive(true);
	}

	togglePanel() {
		this.panel.value?.toggle();
	}
}

export function isPanelDock(obj: any): obj is PanelDock {
	return obj && obj.isPanelDock;
}

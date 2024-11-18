import { createContent, uniqueId } from '@arvin-shu/microcode-utils';
import { computed, h, Ref, ref, VNode } from 'vue';
import { getEvent } from '@arvin-shu/microcode-shell';
import { IWidget } from './widget';
import { ISkeleton } from '../skeleton';
import { DockConfig } from '../types';
import { DockView, WidgetView } from '../components/widget-views';

export class Dock implements IWidget {
	readonly isWidget = true;

	readonly id = uniqueId('dock');

	readonly name: string;

	readonly align?: string;

	private _visible = ref(true);

	visible = computed(() => this._visible.value);

	private _disabled = ref(false);

	get content(): VNode {
		return h(WidgetView, {
			widget: this,
			key: this.id,
		});
	}

	inited: Ref<boolean> = ref(false);

	private _body: VNode;

	get body() {
		if (this.inited.value) {
			return this._body;
		}
		const { props, content, contentProps } = this.config;
		if (content) {
			this._body = createContent(content!, {
				...contentProps,
				config: this.config,
				editor: getEvent(this.skeleton.editor),
			});
		} else {
			this._body = h(DockView, props);
		}
		this.inited.value = true;

		return this._body;
	}

	constructor(
		readonly skeleton: ISkeleton,
		readonly config: DockConfig
	) {
		const { props = {}, name } = config;
		this.name = name;
		this.align = props.align;
		if (props.onInit) {
			props.onInit.call(this, this);
		}
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

	getContent() {
		return this.content;
	}

	getName() {
		return this.name;
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
}

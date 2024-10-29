import { computed, ComputedRef, h, Ref, ref, VNode } from 'vue';
import {
	IPublicTypeWidgetBaseConfig,
	IPublicTypeTitleContent,
} from '@arvin/microcode-types';
import { createContent, uniqueId } from '@arvin/microcode-utils';
import { getEvent } from '@arvin/microcode-shell';
import { ISkeleton } from '../skeleton';
import { WidgetConfig } from '../types';
import { WidgetView } from '../components/widget-views';

export interface IWidget {
	readonly name: string;
	readonly content: VNode;
	readonly align?: string;
	readonly isWidget: true;
	readonly visible: ComputedRef<boolean>;
	readonly disabled?: boolean;
	readonly body: VNode;
	readonly skeleton: ISkeleton;
	readonly config: IPublicTypeWidgetBaseConfig;

	getName(): string;
	getContent(): any;
	show(): void;
	hide(): void;
	toggle(): void;
	enable?(): void;
	disable?(): void;
}

export class Widget implements IWidget {
	readonly isWidget = true;

	readonly id = uniqueId('widget');

	readonly name: string;

	readonly align?: string;

	private _visible = ref(true);

	visible = computed(() => this._visible.value);

	inited: Ref<boolean> = ref(false);

	private _disabled = ref(false);

	private _body: VNode;

	get body() {
		if (this.inited.value) {
			return this._body;
		}
		this.inited.value = true;
		const { content, contentProps } = this.config;
		this._body = createContent(content!, {
			...contentProps,
			config: this.config,
			editor: getEvent(this.skeleton.editor),
		});
		return this._body;
	}

	get content(): VNode {
		return h(WidgetView, {
			widget: this,
			key: this.id,
		});
	}

	readonly title: IPublicTypeTitleContent;

	constructor(
		readonly skeleton: ISkeleton,
		readonly config: WidgetConfig
	) {
		const { props = {}, name } = config;
		this.name = name;
		this.align = props.align;
		this.title = props.title || name;
		if (props.onInit) {
			props.onInit.call(this, this);
		}
	}

	getId() {
		return this.id;
	}

	getName() {
		return this.name;
	}

	getContent() {
		return this.content;
	}

	hide() {
		this.setVisible(false);
	}

	show() {
		this.setVisible(true);
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
}

export function isWidget(obj: any): obj is IWidget {
	return obj && obj.isWidget;
}

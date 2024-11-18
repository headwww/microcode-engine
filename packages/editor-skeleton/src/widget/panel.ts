import { computed, h, ref, toRaw } from 'vue';
import {
	createModuleEventBus,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import {
	IPublicTypeHelpTipConfig,
	IPublicTypePanelConfig,
	IPublicTypeTitleContent,
} from '@arvin-shu/microcode-types';
import { createContent, uniqueId } from '@arvin-shu/microcode-utils';
import { getEvent } from '@arvin-shu/microcode-shell';
import { WidgetContainer } from './widget-container';
import { composeTitle, ISkeleton, isPanelDock, IWidget, PanelDock } from '..';
import { PanelView, TitledPanelView } from '../components/widget-views';

export class Panel implements IWidget {
	readonly isWidget = true;

	readonly name: string;

	readonly id: string;

	inited = ref(false);

	private _actived = ref(false);

	private emitter: IEventBus = createModuleEventBus('Panel');

	actived = computed(() => this._actived.value);

	visible = computed(() => {
		if (!this.parent.value || this.parent.value.visible) {
			const { props } = this.config;
			if (props?.condition) {
				return props.condition(this);
			}
			return this._actived.value;
		}
		return false;
	});

	get body() {
		const { content, contentProps } = this.config;

		return createContent(content!, {
			...contentProps,
			editor: getEvent(this.skeleton.editor),
			config: this.config,
			panel: this,
			pane: this,
		});
	}

	get content() {
		const area = this.config?.area || this.parent.value?.name;
		if (this.plain) {
			return h(PanelView, {
				panel: this,
				key: this.id,
				area,
			});
		}
		return h(TitledPanelView, {
			panel: this,
			key: this.id,
			area,
		});
	}

	readonly title: IPublicTypeTitleContent;

	readonly help?: IPublicTypeHelpTipConfig;

	private plain = false;

	private container?: WidgetContainer<Panel, IPublicTypePanelConfig>;

	readonly isPanel = true;

	public parent = ref<WidgetContainer>();

	constructor(
		readonly skeleton: ISkeleton,
		readonly config: IPublicTypePanelConfig
	) {
		const { content, name, props = {} } = config;
		const { hideTitleBar, title, icon, description, help } = props;
		this.name = name;
		this.id = uniqueId(`pane:${name}$`);
		this.title = composeTitle(title || name, icon, description) || '';
		this.plain = hideTitleBar || !title;
		this.help = help;

		if (Array.isArray(content)) {
			this.container = this.skeleton.createContainer(
				name,
				(item) => {
					if (isPanel(item)) {
						return item;
					}
					return this.skeleton.createPanel(item);
				},
				true,
				() => this.visible.value,
				true
			);
			content.forEach((item) => this.add(item));
		}
		if (props.onInit) {
			props.onInit.call(this, this);
		}
		if (typeof content !== 'string' && content && (content as any).onInit) {
			(content as any).onInit.call(this, this);
		}
	}

	setParent(parent: WidgetContainer) {
		if (parent === toRaw(this.parent.value)) {
			return;
		}
		if (this.parent.value) {
			toRaw(this.parent.value).remove(this);
		}

		this.parent.value = parent;
	}

	add(item: Panel | IPublicTypePanelConfig) {
		return this.container?.add(item);
	}

	getPane(name: string): Panel | null {
		return this.container?.get(name) || null;
	}

	remove(item: Panel | string) {
		return this.container?.remove(item);
	}

	active(item?: Panel | string | null) {
		if (item) {
			this.container?.active(item);
		} else {
			this.setActive(true);
		}
	}

	getName() {
		return this.name;
	}

	getContent() {
		return this.content;
	}

	/**
	 * 检查当前面板是否处于float area
	 *
	 * @returns {boolean}
	 * @memberof Panel
	 */
	isChildOfFloatArea(): boolean {
		return this.parent.value?.name === 'leftFloatArea';
	}

	/**
	 * 检查当前面板是否位于fixed area
	 *
	 * @returns {boolean}
	 * @memberof Panel
	 */
	isChildOfFixedArea(): boolean {
		return this.parent.value?.name === 'leftFixedArea';
	}

	setActive(flag: boolean) {
		if (flag === this._actived.value) {
			// TODO: 如果移动到另外一个 container，会有问题
			return;
		}

		if (flag) {
			// 对于 Area 的直接 Child，要专门处理 Float & Fixed 分组切换, 其他情况不需要
			if (this.isChildOfFloatArea()) {
				this.skeleton.leftFixedArea.container.unactiveAll();
			} else if (this.isChildOfFixedArea()) {
				this.skeleton.leftFloatArea.container.unactiveAll();
			}
			this._actived.value = true;

			toRaw(this.parent.value)?.active(this);
			if (!this.inited.value) {
				this.inited.value = true;
			}
			this.emitter.emit('activechange', true);
		} else {
			if (
				this.parent.value?.name &&
				this.name.startsWith(this.parent.value.name)
			) {
				this.inited.value = false;
			}
			this._actived.value = false;
			toRaw(this.parent.value)?.unactive(this);
			this.emitter.emit('activechange', false);
		}
	}

	toggle() {
		this.setActive(!this._actived.value);
	}

	hide() {
		this.setActive(false);
	}

	disable() {}

	enable(): void {}

	show() {
		this.setActive(true);
	}

	getAssocDocks(): PanelDock[] {
		return this.skeleton.widgets.filter(
			(item) => isPanelDock(item) && item.panelName === this.name
		) as any;
	}
}
export function isPanel(obj: any): obj is Panel {
	return obj && obj.isPanel;
}

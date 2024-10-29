import { computed, ref } from 'vue';
import { Logger } from '@arvin/microcode-utils';
import { IPublicTypeWidgetBaseConfig } from '@arvin/microcode-types';
import { ISkeleton } from './skeleton';
import { IWidget, WidgetContainer } from './widget';

const logger = new Logger({ level: 'warn', bizName: 'skeleton:area' });

export interface IArea<C, T> {
	isEmpty(): boolean;
	add(config: T | C): T;
	remove(config: T | string): number;
	setVisible(flag: boolean): void;
	hide(): void;
	show(): void;
}

export class Area<
	C extends IPublicTypeWidgetBaseConfig = any,
	T extends IWidget = IWidget,
> implements IArea<C, T>
{
	private _visible = ref(true);

	/**
	 * 控制区域的显示隐藏
	 */
	visible = computed(() => {
		// 如果是独占模式则当有选中的激活的widget的时候才会显示否则隐藏，一般是leftFloatArea是这种模式
		if (this.exclusive) {
			// 计算属性：计算widgetcontainer有没有选中的widget
			return this.container.current != null;
		}
		// 其他情况默认显示
		return this._visible.value;
	});

	/**
	 * 当前区域选中的widget
	 */
	get current() {
		if (this.exclusive) {
			return this.container.current;
		}
		return null;
	}

	readonly container: WidgetContainer<T, C>;

	private lastCurrent: T | null = null;

	constructor(
		readonly skeleton: ISkeleton,
		readonly name: string,
		handle: (item: T | C) => T,
		private exclusive?: boolean,
		defaultSetCurrent = false
	) {
		this.container = skeleton.createContainer(
			name,
			handle,
			exclusive,
			() => this.visible.value,
			defaultSetCurrent
		);
	}

	isEmpty(): boolean {
		return this.container.items.value.length < 1;
	}

	add(config: C | T): T {
		const item = this.container.get(config.name);
		if (item) {
			logger.warn(`The ${config.name} has already been added to skeleton.`);
			return item;
		}
		return this.container.add(config);
	}

	remove(config: string | T): number {
		return this.container.remove(config);
	}

	setVisible(flag: boolean): void {
		if (this.exclusive) {
			const { current } = this.container;
			if (flag && !current) {
				this.container.active(this.lastCurrent || this.container.getAt(0));
			} else if (current) {
				this.lastCurrent = current;
				this.container.unactive(current);
			}
			return;
		}
		this._visible.value = flag;
	}

	hide() {
		this.setVisible(false);
	}

	show() {
		this.setVisible(true);
	}
}

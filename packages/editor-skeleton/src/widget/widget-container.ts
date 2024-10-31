import { computed, ref, shallowRef, ShallowRef, toRaw } from 'vue';
import { hasOwnProperty } from '@arvin/microcode-utils';
import { isPanel } from './panel';

export interface WidgetItem {
	name: string;
}

export interface Activeable {
	setActive(flag: boolean): void;
}

function isActiveable(obj: any): obj is Activeable {
	return obj && obj.setActive;
}

/**
 * 区域内的小部件容器
 */
export class WidgetContainer<
	T extends WidgetItem = any,
	G extends WidgetItem = any,
> {
	private maps: { [name: string]: T } = {};

	items: ShallowRef<Array<T>> = shallowRef([]);

	/**
	 * 当前选中的widget
	 */
	private _current = ref<(T & Activeable) | null>(null);

	get current() {
		return this._current.value;
	}

	// eslint-disable-next-line no-useless-constructor
	constructor(
		readonly name: string,
		private handle: (item: T | G) => T,
		private exclusive: boolean = false,
		private checkVisible: () => boolean = () => true,
		private defaultSetCurrent: boolean = false
	) {
		//
	}

	visible = computed(() => this.checkVisible());

	active(nameOrItem?: T | string | null) {
		let item: any = nameOrItem;
		if (nameOrItem && typeof nameOrItem === 'string') {
			item = this.get(nameOrItem);
		}

		if (!isActiveable(item)) {
			item = null;
		}
		if (this.exclusive) {
			if (toRaw(this._current.value) === item) {
				return;
			}

			if (toRaw(this._current.value)) {
				toRaw(this._current.value)?.setActive(false);
			}
			this._current.value = item;
		}

		if (item) {
			item.setActive(true);
		}
	}

	unactive(nameOrItem?: T | string | null) {
		let item: any = nameOrItem;
		if (nameOrItem && typeof nameOrItem === 'string') {
			item = this.get(nameOrItem);
		}
		if (!isActiveable(item)) {
			item = null;
		}
		if (toRaw(this._current.value) === item) {
			this._current.value = null;
		}
		if (item) {
			item.setActive(false);
		}
	}

	unactiveAll() {
		Object.keys(this.maps).forEach((name) => this.unactive(name));
	}

	add(item: T | G): T {
		item = this.handle(item);
		const origin = this.get(item.name);
		if (origin === item) {
			return origin;
		}
		const i = origin ? this.items.value.indexOf(origin) : -1;
		if (i > -1) {
			this.items.value.splice(i, 1, item);
		} else {
			this.items.value.push(item);
		}
		this.maps[item.name] = item;

		if (isPanel(item)) {
			item.setParent(this);
		}
		if (this.defaultSetCurrent) {
			const shouldHiddenWhenInit = (item as any).config?.props?.hiddenWhenInit;
			if (!this._current.value && !shouldHiddenWhenInit) {
				this.active(item);
			}
		}
		return item;
	}

	get(name: string): T | null {
		return this.maps[name] || null;
	}

	getAt(index: number): T | null {
		return this.items.value[index] || null;
	}

	has(name: string): boolean {
		return hasOwnProperty(this.maps, name);
	}

	indexOf(item: T): number {
		return this.items.value.indexOf(item);
	}

	remove(item: string | T): number {
		const thing = typeof item === 'string' ? this.get(item) : item;
		if (!thing) {
			return -1;
		}
		const i = this.items.value.indexOf(thing);
		if (i > -1) {
			this.items.value.splice(i, 1);
		}
		delete this.maps[thing.name];
		if (thing === this.current) {
			this._current.value = null;
		}
		return i;
	}
}

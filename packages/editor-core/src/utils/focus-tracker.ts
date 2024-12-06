export class FocusTracker {
	// 存储当前活跃的 Focusable 实例（处于焦点中的元素）。
	private actives: Focusable[] = [];

	private modals: Array<{
		checkDown: (e: MouseEvent) => boolean;
		checkOpen: () => boolean;
	}> = [];

	get first() {
		return this.actives[0];
	}

	addModal(checkDown: (e: MouseEvent) => boolean, checkOpen: () => boolean) {
		this.modals.push({
			checkDown,
			checkOpen,
		});
	}

	private checkModalOpen(): boolean {
		return this.modals.some((item) => item.checkOpen());
	}

	private checkModalDown(e: MouseEvent): boolean {
		return this.modals.some((item) => item.checkDown(e));
	}

	execSave() {
		// has Modal return;
		if (this.checkModalOpen()) {
			return;
		}
		// catch
		if (this.first) {
			this.first.internalTriggerSave();
		}
	}

	execEsc() {
		const { first } = this;
		if (first) {
			this.internalSuspenseItem(first);
			first.internalTriggerEsc();
		}
	}

	mount(win: Window) {
		const checkDown = (e: MouseEvent) => {
			const { first } = this;
			if (first && !first.internalCheckInRange(e)) {
				// 失去焦点
				this.internalSuspenseItem(first);
				first.internalTriggerBlur();
			}
		};
		win.document.addEventListener('click', checkDown, true);

		return () => {
			win.removeEventListener('click', checkDown, true);
		};
	}

	/**
	 * 创建一个新的 Focusable 实例，并将其注册到 FocusTracker 中。
	 * @param config
	 * @returns
	 */
	create(config: FocusableConfig) {
		return new Focusable(this, config);
	}

	/**
	 * 将传入的 Focusable 设置为活跃项，并触发当前活跃项的 onBlur 回调（如果有）。
	 * @param item 当前活跃的
	 */
	internalActiveItem(item: Focusable) {
		// 获取当前活跃的元素，判断当前激活的元素是否已经活跃
		const first = this.actives[0];
		if (first === item) {
			return;
		}
		// 从 actives 中移除当前激活的 item（如果存在）：
		const i = this.actives.indexOf(item);
		if (i > -1) {
			this.actives.splice(i, 1);
		}
		// 将当前激活的 item 添加到 actives 数组的第一个位置，以更新它为当前的焦点元素。
		this.actives.unshift(item);
		// 如果当前激活的 item 不是模态窗口 (!item.isModal) 且存在之前的焦点元素 first，
		// 则触发 first 的 internalTriggerBlur() 方法，使之前的焦点元素失去焦点。
		// 这可以确保在非模态窗口间切换时，焦点变化能够触发 blur 事件。
		if (!item.isModal && first) {
			first.internalTriggerBlur();
		}
		// 调用 item 的 internalTriggerActive 方法，以触发激活状态的回调或执行激活事件。
		// 这一方法可以用于更新 UI 或执行一些焦点激活时的逻辑。
		item.internalTriggerActive();
	}

	internalSuspenseItem(item: Focusable) {
		const i = this.actives.indexOf(item);
		if (i > -1) {
			this.actives.splice(i, 1);
			// 触发新的首个活跃元素的激活事件
			this.first?.internalTriggerActive();
		}
	}
}

export interface FocusableConfig {
	// 用于指定一个可聚焦元素的点击范围。
	range: HTMLElement | ((e: MouseEvent) => boolean);
	modal?: boolean; // 模态窗口级别
	onEsc?: () => void;
	onBlur?: () => void;
	onSave?: () => void;
	onActive?: () => void;
}

export class Focusable {
	readonly isModal?: boolean;

	constructor(
		private tracker: FocusTracker,
		private config: FocusableConfig
	) {
		this.isModal = config.modal === null ? false : config.modal;
	}

	active() {
		this.tracker.internalActiveItem(this);
	}

	suspense() {
		this.tracker.internalSuspenseItem(this);
	}

	purge() {
		this.tracker.internalSuspenseItem(this);
	}

	internalCheckInRange(e: MouseEvent) {
		const { range } = this.config;
		if (!range) {
			return false;
		}
		if (typeof range === 'function') {
			return range(e);
		}

		return range.contains(e.target as HTMLElement);
	}

	internalTriggerBlur() {
		if (this.config.onBlur) {
			this.config.onBlur();
		}
	}

	internalTriggerSave() {
		if (this.config.onSave) {
			this.config.onSave();
			return true;
		}
		return false;
	}

	internalTriggerEsc() {
		if (this.config.onEsc) {
			this.config.onEsc();
		}
	}

	internalTriggerActive() {
		if (this.config.onActive) {
			this.config.onActive();
		}
	}
}

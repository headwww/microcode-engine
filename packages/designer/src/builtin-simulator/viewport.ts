import { computed, ref } from 'vue';
import { isNaN } from 'lodash';
import { AutoFit, IViewport } from '../simulator';
import { Point } from '../designer';

/**
 * TODO 滚动视图没有考虑
 *
 */
export default class Viewport implements IViewport {
	private rect = ref<DOMRect>();

	private viewportElement?: HTMLElement;

	private _scale = ref(1);

	private readonly computedScale = computed(() => this._scale.value);

	get scale(): number {
		return this.computedScale.value;
	}

	set scale(newScale: number) {
		if (isNaN(newScale) || newScale <= 0) {
			throw new Error(`invalid new scale "${newScale}"`);
		}
		this._scale.value = newScale;
		this._contentWidth.value = this.width / this.scale;
		this._contentHeight.value = this.height / this.scale;
	}

	private _contentHeight = ref<number | AutoFit>(AutoFit);

	private _contentWidth = ref<number | AutoFit>(AutoFit);

	private readonly computedContentHeight = computed(
		() => this._contentHeight.value
	);

	get contentHeight(): number | AutoFit {
		return this.computedContentHeight.value;
	}

	set contentHeight(value: number | AutoFit) {
		this._contentHeight.value = value;
	}

	private readonly computedContentWidth = computed(
		() => this._contentWidth.value
	);

	get contentWidth(): number | AutoFit {
		return this.computedContentWidth.value;
	}

	set contentWidth(value: number | AutoFit) {
		this._contentWidth.value = value;
	}

	private _bounds?: DOMRect;

	get bounds(): DOMRect {
		if (this._bounds) {
			return this._bounds;
		}
		this._bounds = this.viewportElement!.getBoundingClientRect();
		requestAnimationFrame(() => {
			this._bounds = undefined;
		});
		return this._bounds;
	}

	/**
	 * 获取内容区域边界
	 */
	get contentBounds(): DOMRect {
		const { bounds, scale } = this;
		return new DOMRect(0, 0, bounds.width / scale, bounds.height / scale);
	}

	mount(viewportElement: HTMLElement | null) {
		if (!viewportElement || this.viewportElement === viewportElement) {
			return;
		}
		this.viewportElement = viewportElement;
		this.touch();
	}

	touch() {
		if (this.viewportElement) {
			this.rect.value = this.bounds;
		}
	}

	private readonly computedHeight = computed(() => {
		if (!this.rect.value) {
			return 600;
		}
		return this.rect.value.height;
	});

	get height(): number {
		return this.computedHeight.value;
	}

	set height(newHeight: number) {
		this._contentHeight.value = newHeight / this.scale;
		if (this.viewportElement) {
			this.viewportElement.style.height = `${newHeight}px`;
			this.touch();
		}
	}

	private readonly computedWidth = computed(() => {
		if (!this.rect.value) {
			return 1000;
		}
		return this.rect.value.width;
	});

	get width(): number {
		return this.computedWidth.value;
	}

	set width(newWidth: number) {
		this._contentWidth.value = newWidth / this.scale;
		if (this.viewportElement) {
			this.viewportElement.style.width = `${newWidth}px`;
			this.touch();
		}
	}

	/**
	 * 将点从视口坐标转换为全局坐标
	 * @param point
	 */

	toGlobalPoint(point: Point): Point {
		if (!this.viewportElement) {
			return point;
		}
		const rect = this.bounds;

		return {
			clientX: point.clientX * this.scale + rect.left,
			clientY: point.clientY * this.scale + rect.top,
		};
	}

	/**
	 * 将点从全局坐标转换为视口坐标
	 * @param point
	 */
	toLocalPoint(point: Point): Point {
		if (!this.viewportElement) {
			return point;
		}

		const rect = this.bounds;
		return {
			clientX: (point.clientX - rect.left) / this.scale,
			clientY: (point.clientY - rect.top) / this.scale,
		};
	}
}

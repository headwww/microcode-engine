// @ts-ignore
import requestIdleCallback, { cancelIdleCallback } from 'ric-shim';
import { uniqueId } from '@arvin-shu/microcode-utils';
import { computed, ref, toRaw } from 'vue';
import { INodeSelector, IViewport } from '../simulator';
import { INode } from '../document';

export class OffsetObserver {
	readonly id = uniqueId('oobx');

	private lastOffsetLeft?: number;

	private lastOffsetTop?: number;

	private lastOffsetHeight?: number;

	private lastOffsetWidth?: number;

	// 位置和尺寸的基础数据
	private _height = ref(0);

	private _width = ref(0);

	private _left = ref(0);

	private _top = ref(0);

	private _right = ref(0);

	private _bottom = ref(0);

	hasOffset = ref(false);

	private readonly computedHeight = computed(() =>
		this.isRoot
			? this.viewport.height
			: this._height.value * this.viewport.scale
	);

	get height() {
		return this.computedHeight.value;
	}

	private readonly computedWidth = computed(() =>
		this.isRoot ? this.viewport.width : this._width.value * this.viewport.scale
	);

	get width() {
		return this.computedWidth.value;
	}

	private readonly computedTop = computed(() =>
		this.isRoot ? 0 : this._top.value * this.viewport.scale
	);

	get top() {
		return this.computedTop.value;
	}

	private readonly computedLeft = computed(() =>
		this.isRoot ? 0 : this._left.value * this.viewport.scale
	);

	get left() {
		return this.computedLeft.value;
	}

	private readonly computedBottom = computed(() =>
		this.isRoot
			? this.viewport.height
			: this._bottom.value * this.viewport.scale
	);

	get bottom() {
		return this.computedBottom.value;
	}

	private readonly computedRight = computed(() =>
		this.isRoot ? this.viewport.width : this._right.value * this.viewport.scale
	);

	get right() {
		return this.computedRight.value;
	}

	private readonly computedOffsetLeft = computed(() => {
		if (this.isRoot) {
			return this.viewport.scrollX * this.viewport.scale;
		}
		if (!this.viewport.scrolling || this.lastOffsetLeft == null) {
			this.lastOffsetLeft =
				this.left + this.viewport.scrollX * this.viewport.scale;
		}
		return this.lastOffsetLeft;
	});

	get offsetLeft() {
		return this.computedOffsetLeft.value;
	}

	private readonly computedOffsetTop = computed(() => {
		if (this.isRoot) {
			return this.viewport.scrollY * this.viewport.scale;
		}
		if (!this.viewport.scrolling || this.lastOffsetTop == null) {
			this.lastOffsetTop =
				this.top + this.viewport.scrollY * this.viewport.scale;
		}
		return this.lastOffsetTop;
	});

	get offsetTop() {
		return this.computedOffsetTop.value;
	}

	private readonly computedOffsetHeight = computed(() => {
		if (!this.viewport.scrolling || this.lastOffsetHeight == null) {
			this.lastOffsetHeight = this.isRoot ? this.viewport.height : this.height;
		}
		return this.lastOffsetHeight;
	});

	get offsetHeight() {
		return this.computedOffsetHeight.value;
	}

	private readonly computedOffsetWidth = computed(() => {
		if (!this.viewport.scrolling || this.lastOffsetWidth == null) {
			this.lastOffsetWidth = this.isRoot ? this.viewport.width : this.width;
		}
		return this.lastOffsetWidth;
	});

	get offsetWidth() {
		return this.computedOffsetWidth.value;
	}

	private readonly computedScale = computed(() => this.viewport?.scale);

	get scale() {
		return this.computedScale.value;
	}

	private pid: number | undefined;

	readonly viewport: IViewport;

	private isRoot: boolean;

	readonly node: INode;

	readonly compute: () => void;

	constructor(readonly nodeInstance: INodeSelector) {
		const { instance, node } = nodeInstance;
		this.node = node;
		const doc = node.document;
		const host = doc?.simulator;
		const focusNode = doc?.focusNode;
		this.isRoot = toRaw(node).contains(toRaw(focusNode)!);
		this.viewport = host?.viewport!;
		if (this.isRoot) {
			this.hasOffset.value = true;
			return;
		}
		if (!instance) {
			return;
		}
		let pid: number | undefined;
		const compute = () => {
			if (pid !== this.pid) {
				return;
			}

			const rect = host?.computeComponentInstanceRect(
				instance!,
				node.componentMeta.rootSelector
			);

			if (!rect) {
				this.hasOffset.value = false;
			} else if (!this.viewport.scrolling || !this.hasOffset.value) {
				this._height.value = rect.height;
				this._width.value = rect.width;
				this._left.value = rect.left;
				this._top.value = rect.top;
				this._right.value = rect.right;
				this._bottom.value = rect.bottom;
				// 如果组件实例的尺寸发生变化，则需要重新计算偏移量
				this.hasOffset.value = true;
			}
			this.pid = requestIdleCallback(compute);
			pid = this.pid;
		};

		this.compute = compute;

		// try first
		compute();
		// try second, ensure the dom mounted
		this.pid = requestIdleCallback(compute);
		pid = this.pid;
	}

	purge() {
		if (this.pid) {
			cancelIdleCallback(this.pid);
		}
		this.pid = undefined;
	}

	isPurged() {
		return this.pid == null;
	}
}

export function createOffsetObserver(
	nodeInstance: INodeSelector
): OffsetObserver | null {
	if (!nodeInstance.instance) {
		return null;
	}
	return new OffsetObserver(nodeInstance);
}

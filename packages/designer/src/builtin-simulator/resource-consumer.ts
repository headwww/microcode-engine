import { ref, watch, type Ref } from 'vue';
import { BuiltinSimulatorHost } from './host';
import { BuiltinSimulatorRenderer, isSimulatorRenderer } from './renderer';

const UNSET = Symbol('unset');
export type MasterProvider = (master: BuiltinSimulatorHost) => any;
export type RendererConsumer<T> = (
	renderer: BuiltinSimulatorRenderer,
	data: T
) => Promise<any>;

export default class ResourceConsumer<T = any> {
	private _data: Ref<T | typeof UNSET> = ref(UNSET);

	private _stopProviding?: () => void;

	private _stopConsuming?: () => void;

	private _firstConsumed = false;

	private resolveFirst?: (resolve?: any) => void;

	constructor(
		provider: () => T,
		private consumer?: RendererConsumer<T>
	) {
		this._stopProviding = watch(
			() => provider(),
			(newValue) => {
				this._data.value = newValue;
			},
			{ immediate: true } // 立即执行一次
		);
	}

	consume(consumerOrRenderer: BuiltinSimulatorRenderer | ((data: T) => any)) {
		if (this._stopConsuming) {
			return;
		}

		let consumer: (data: T) => any;
		if (isSimulatorRenderer(consumerOrRenderer)) {
			if (!this.consumer) {
				return;
			}
			const rendererConsumer = this.consumer!;
			consumer = (data) => rendererConsumer(consumerOrRenderer, data);
		} else {
			consumer = consumerOrRenderer;
		}

		this._stopConsuming = watch(
			() => this._data.value,
			async (newValue) => {
				if (newValue === UNSET) {
					return;
				}
				await consumer(newValue);

				if (this.resolveFirst) {
					this.resolveFirst();
				} else {
					this._firstConsumed = true;
				}
			},
			{ immediate: true }
		);
	}

	dispose() {
		// 清理 watch 监听器
		if (this._stopProviding) {
			this._stopProviding();
		}
		if (this._stopConsuming) {
			this._stopConsuming();
		}
	}

	waitFirstConsume(): Promise<any> {
		if (this._firstConsumed) {
			return Promise.resolve();
		}
		return new Promise((resolve) => {
			this.resolveFirst = resolve;
		});
	}
}

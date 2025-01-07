/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-01-06 16:48:59
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-01-07 12:20:30
 * @FilePath: /microcode-engine/packages/designer/src/builtin-simulator/resource-consumer.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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

import { EventEmitter2 } from 'eventemitter2';
import { ref, watchEffect, type Ref } from 'vue';

class TransactionManager {
	private emitter = new EventEmitter2({
		wildcard: true,
		delimiter: '.',
		maxListeners: 0,
	});

	executeTransaction = (fn: () => void, type: any): void => {
		this.emitter.emit(`${type}.startTransaction`);
		const result: Ref<any> = ref(null);
		watchEffect(() => {
			result.value = fn();
		});
		this.emitter.emit(`${type}.endTransaction`);
	};

	onStartTransaction = (fn: () => void, type: any): (() => void) => {
		this.emitter.on(`${type}.startTransaction`, fn);
		return () => {
			this.emitter.off(`${type}.startTransaction`, fn);
		};
	};

	onEndTransaction = (fn: () => void, type: any): (() => void) => {
		this.emitter.on(`${type}.endTransaction`, fn);
		return () => {
			this.emitter.off(`${type}.endTransaction`, fn);
		};
	};
}

export const transactionManager = new TransactionManager();

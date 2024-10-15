import { IPublicModelPreference } from '@arvin/microcode-types';
import { getLogger } from '@arvin/microcode-utils';
import store from 'store';

const logger = getLogger({ level: 'warn', bizName: 'Preference' });
const STORAGE_KEY_PREFIX = 'sw';

export default class Preference implements IPublicModelPreference {
	getStorageKey(key: string, module?: string): string {
		const moduleKey = module || '__inner__';
		return `${STORAGE_KEY_PREFIX}_${moduleKey}.${key}`;
	}

	set(key: string, value: any, module?: string): void {
		if (!key || typeof key !== 'string' || key.length === 0) {
			logger.error('Invalid key when setting preference', key);
			return;
		}
		const storageKey = this.getStorageKey(key, module);
		logger.debug('storageKey:', storageKey, 'set with value:', value);
		store.set(storageKey, value);
	}

	get(key: string, module: string): any {
		if (!key || typeof key !== 'string' || key.length === 0) {
			logger.error('Invalid key when getting from preference', key);
			return;
		}
		const storageKey = this.getStorageKey(key, module);
		const result = store.get(storageKey);
		logger.debug('storageKey:', storageKey, 'get with result:', result);
		return result;
	}

	/**
	 * 检查本地存储是否包含特定密钥
	 *
	 * @param key
	 * @param module
	 * @returns
	 */
	contains(key: string, module: string): boolean {
		if (!key || typeof key !== 'string' || key.length === 0) {
			logger.error('Invalid key when getting from preference', key);
			return false;
		}
		const storageKey = this.getStorageKey(key, module);
		const result = store.get(storageKey);

		return !(result === undefined || result === null);
	}
}

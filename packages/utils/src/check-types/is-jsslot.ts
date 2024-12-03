import { IPublicTypeJSSlot } from '@arvin-shu/microcode-types';
import { isObject } from '../is-object';

export function isJSSlot(data: any): data is IPublicTypeJSSlot {
	if (!isObject(data)) {
		return false;
	}
	return data.type === 'JSSlot';
}

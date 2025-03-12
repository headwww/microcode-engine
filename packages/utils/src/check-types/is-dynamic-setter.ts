import { isFunction } from 'lodash-es';
import { IPublicTypeDynamicSetter } from '@arvin-shu/microcode-types';
import { isVueComponent } from '../is-vue';

export function isDynamicSetter(obj: any): obj is IPublicTypeDynamicSetter {
	if (!isFunction(obj)) {
		return false;
	}
	return !isVueComponent(obj);
}

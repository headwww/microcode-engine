import { IPublicTypeProjectSchema } from '@arvin-shu/microcode-types';
import { isObject } from '../is-object';

export function isProjectSchema(data: any): data is IPublicTypeProjectSchema {
	if (!isObject(data)) {
		return false;
	}
	return 'componentsTree' in data;
}

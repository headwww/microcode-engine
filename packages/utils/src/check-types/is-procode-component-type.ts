import {
	IPublicTypeComponentMap,
	IPublicTypeProCodeComponent,
} from '@arvin-shu/microcode-types';
import { isObject } from '../is-object';

export function isProCodeComponentType(
	desc: IPublicTypeComponentMap
): desc is IPublicTypeProCodeComponent {
	if (!isObject(desc)) {
		return false;
	}

	return 'package' in desc;
}

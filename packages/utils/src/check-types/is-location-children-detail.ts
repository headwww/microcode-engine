import {
	IPublicTypeLocationChildrenDetail,
	IPublicTypeLocationDetailType,
} from '@arvin-shu/microcode-types';
import { isObject } from '../is-object';

export function isLocationChildrenDetail(
	obj: any
): obj is IPublicTypeLocationChildrenDetail {
	if (!isObject(obj)) {
		return false;
	}
	return obj.type === IPublicTypeLocationDetailType.Children;
}

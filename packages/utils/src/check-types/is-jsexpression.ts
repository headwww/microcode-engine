import { IPublicTypeJSExpression } from '@arvin/microcode-types';
import { isObject } from '../is-object';

export function isJSExpression(data: any): data is IPublicTypeJSExpression {
	if (!isObject(data)) {
		return false;
	}
	return data.type === 'JSExpression' && data.extType !== 'function';
}

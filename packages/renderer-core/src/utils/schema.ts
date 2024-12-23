import {
	IPublicEnumTransformStage,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import { isObject, isFunction } from './check';

export function exportSchema<T extends IPublicTypeNodeSchema>(
	node: unknown
): T {
	if (isObject(node)) {
		if (isFunction(node.export)) {
			return node.export(IPublicEnumTransformStage.Render);
		}
		if (isFunction(node.exportSchema)) {
			return node.exportSchema(IPublicEnumTransformStage.Render);
		}
	}
	return null as unknown as T;
}

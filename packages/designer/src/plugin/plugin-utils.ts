import {
	IPublicTypePluginDeclaration,
	IPublicTypePluginRegisterOptions,
} from '@arvin-shu/microcode-types';
import { isPlainObject } from '@arvin-shu/microcode-utils';

/**
 * 对传入的选项 opts 进行验证和过滤，保留那些在偏好声明中定义的有效选项。
 * 判断plugins.register中设置的插件的用户偏好有没有在meta中声明
 *
 * @param opts
 * @param preferenceDeclaration
 * @returns
 */

export function filterValidOptions(
	opts: any,
	preferenceDeclaration: IPublicTypePluginDeclaration
) {
	if (!opts || !isPlainObject(opts)) return opts;
	const filteredOpts = {} as any;
	Object.keys(opts).forEach((key) => {
		if (isValidPreferenceKey(key, preferenceDeclaration)) {
			const v = opts[key];
			if (v !== undefined && v !== null) {
				filteredOpts[key] = v;
			}
		}
	});
	return filteredOpts;
}

export function isMicrocodeRegisterOptions(
	opts: any
): opts is IPublicTypePluginRegisterOptions {
	return opts && ('autoInit' in opts || 'override' in opts);
}

export function isValidPreferenceKey(
	key: string,
	preferenceDeclaration: IPublicTypePluginDeclaration
): boolean {
	if (
		!preferenceDeclaration ||
		!Array.isArray(preferenceDeclaration.properties)
	) {
		return false;
	}
	return preferenceDeclaration.properties.some((prop) => prop.key === key);
}

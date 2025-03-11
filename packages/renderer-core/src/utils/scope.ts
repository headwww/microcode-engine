import {
	ComponentPublicInstance,
	isProxy,
	isReactive,
	proxyRefs,
	reactive,
} from 'vue';
import { DataSourceMap } from '@arvin-shu/microcode-datasource-types';
import { SchemaParser } from './parse';
import { isBoolean, isObject, isUndefined } from './check';

export interface BlockScope {
	[x: string | symbol]: unknown;
}

declare module 'vue' {
	export interface ComponentInternalInstance {
		ctx: Record<string, unknown>;
		setupState: Record<string, unknown>;
		emitsOptions: Record<string, ((...args: any[]) => unknown) | null>;
		propsOptions: [Record<string, object>, string[]];
		accessCache: Record<string, AccessTypes>;
		propsDefaults: Record<string, unknown>;
	}
}

export const enum AccessTypes {
	OTHER,
	SETUP,
	DATA,
	PROPS,
	CONTEXT,
}

export interface RuntimeScope extends BlockScope, ComponentPublicInstance {
	i18n(key: string, values: any): string;
	currentLocale: string;
	dataSourceMap: Record<string, DataSourceMap>;
	reloadDataSource(): Promise<any[]>;
	__parser: SchemaParser;
	__thisRequired: boolean;
	__loopScope?: boolean;
	__loopRefIndex?: number;
	__loopRefOffset?: number;
}

export type MaybeArray<T> = T | T[];

export function isRuntimeScope(scope: object): scope is RuntimeScope {
	return '$' in scope;
}

export function isValidScope(
	scope: unknown
): scope is BlockScope | RuntimeScope {
	// 为 null、undefined，或者不是对象
	if (!scope || !isObject(scope)) return false;

	// runtime scope
	if (isRuntimeScope(scope)) return true;

	// scope 属性不为空
	if (Object.keys(scope).length > 0) return true;
	return false;
}

export function getAccessTarget(
	scope: RuntimeScope,
	accessType: AccessTypes
): Record<string, unknown> {
	switch (accessType) {
		case AccessTypes.SETUP:
			// eslint-disable-next-line no-return-assign
			return scope.$.setupState.__mtcSetup
				? scope.$.setupState
				: (scope.$.setupState = proxyRefs(
						Object.create(null, {
							__mtcSetup: {
								get: () => true,
								enumerable: false,
								configurable: false,
							},
						})
					));
		case AccessTypes.DATA:
			// eslint-disable-next-line no-return-assign
			return isReactive(scope.$.data)
				? scope.$.data
				: (scope.$.data = reactive({}));
		case AccessTypes.PROPS:
			return scope.$.props;
		default:
			return scope.$.ctx;
	}
}

export function addToScope(
	scope: RuntimeScope,
	accessType: AccessTypes,
	source: object,
	useDefineProperty?: boolean,
	buildPropsOptions = true
) {
	const instance = scope.$;
	const target = getAccessTarget(scope, accessType);
	if (useDefineProperty) {
		const descriptors = Object.getOwnPropertyDescriptors(source);
		// eslint-disable-next-line guard-for-in
		for (const key in descriptors) {
			if (key in target) {
				// eslint-disable-next-line no-console
				console.warn(`重复定义 key: ${key}`);
				continue;
			}
			Object.defineProperty(target, key, descriptors[key]);
			instance.accessCache[key] = accessType;
		}
	} else {
		// eslint-disable-next-line guard-for-in
		for (const key in source) {
			if (key in target) {
				// eslint-disable-next-line no-console
				console.warn(`重复定义 key: ${key}`);
				continue;
			}
			target[key] = Reflect.get(source, key);
			instance.accessCache[key] = accessType;
		}
	}

	if (
		accessType === AccessTypes.PROPS &&
		Object.keys(source).length > 0 &&
		buildPropsOptions
	) {
		const {
			propsOptions: [rawPropsOptions, rawNeedCastKeys],
		} = instance;
		const propsOptions: Record<string, object> = {};
		const needCastKeys: string[] = [];
		for (const key in source) {
			if (rawPropsOptions[key]) continue;

			const val = Reflect.get(source, key);
			if (isBoolean(val)) {
				propsOptions[key] = {
					// 不传入值时默认为 val
					0: true,
					// passVal === '' || passVal === key 时需要转化为 true
					1: true,
					type: Boolean,
					default: val,
				};
				needCastKeys.push(key);
			} else if (!isUndefined(val)) {
				propsOptions[key] = {
					// 不传入值时默认为 val
					0: true,
					1: false,
					type: null,
					default: val,
				};
				needCastKeys.push(key);
			} else {
				propsOptions[key] = {
					0: false,
					1: false,
					type: null,
				};
			}
		}

		if (Object.keys(propsOptions).length > 0) {
			instance.propsOptions = [
				{ ...rawPropsOptions, ...propsOptions },
				[...rawNeedCastKeys, ...needCastKeys],
			];
		}
	}
}

export function mergeScope(
	scope: RuntimeScope,
	...blockScope: MaybeArray<BlockScope | undefined | null>[]
): RuntimeScope;
export function mergeScope(
	...blockScope: MaybeArray<BlockScope | undefined | null>[]
): BlockScope;
export function mergeScope(
	...scopes: MaybeArray<RuntimeScope | BlockScope | undefined | null>[]
): RuntimeScope | BlockScope {
	const normalizedScope: (RuntimeScope | BlockScope)[] = [];
	scopes.flat().forEach((scope) => {
		isValidScope(scope) && normalizedScope.push(scope);
	});

	if (normalizedScope.length <= 1) return normalizedScope[0];

	const [rootScope, ...resScopes] = normalizedScope;
	return resScopes.reduce((result, scope) => {
		if (isRuntimeScope(scope)) {
			if (!isRuntimeScope(result)) {
				const temp = result;
				result = scope;
				scope = temp;
			} else {
				return scope;
			}
		}

		const descriptors = Object.getOwnPropertyDescriptors(scope);
		result = Object.create(result, descriptors);
		return isProxy(scope) ? reactive(result) : result;
	}, rootScope);
}

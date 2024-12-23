import {
	IPublicTypeContainerSchema,
	IPublicTypeI18nData,
	IPublicTypeJSExpression,
	IPublicTypeJSFunction,
} from '@arvin-shu/microcode-types';
import { BlockScope, RuntimeScope } from './scope';
import {
	isArray,
	isFunction,
	isI18nData,
	isJSExpression,
	isJSFunction,
	isPlainObject,
	isString,
} from './check';
import { ensureArray } from './array';

export interface SchemaParserOptions {
	thisRequired?: boolean;
}

export const EXPRESSION_TYPE = {
	JSEXPRESSION: 'JSExpression',
	JSFUNCTION: 'JSFunction',
	JSSLOT: 'JSSlot',
	JSBLOCK: 'JSBlock',
	I18N: 'i18n',
} as const;

export class SchemaParser {
	private createFunction: (code: string) => CallableFunction;

	static cacheModules: Record<string, object> = {};

	static cleanCachedModules() {
		this.cacheModules = {};
	}

	private exports = {};

	constructor(options?: SchemaParserOptions) {
		this.createFunction =
			options && !options.thisRequired
				? (code) =>
						new Function(
							'__exports__',
							'__scope__',
							`with(__exports__) { with(__scope__) { ${code} } }`
						)
				: (code) =>
						new Function('__exports__', `with(__exports__) { ${code} }`);
	}

	initModule(schema: IPublicTypeContainerSchema) {
		const initModuleSchema = schema?.lifeCycles?.initModule;
		const res = initModuleSchema
			? this.parseSchema(initModuleSchema, false)
			: initModuleSchema;
		this.exports = isFunction(res)
			? res(SchemaParser.cacheModules, window)
			: {};
		return this;
	}

	parseI18n(i18nInfo: IPublicTypeI18nData, scope?: RuntimeScope | boolean) {
		return this.parseExpression(
			{
				type: EXPRESSION_TYPE.JSEXPRESSION,
				value: `this.$t(${JSON.stringify(i18nInfo.key)})`,
			},
			scope
		) as unknown as string | undefined;
	}

	parseSchema(
		schema: IPublicTypeI18nData,
		scope?: RuntimeScope | boolean
	): string | undefined;

	parseSchema(
		schema: IPublicTypeJSFunction,
		scope?: RuntimeScope | boolean
	): CallableFunction;

	parseSchema(
		schema: IPublicTypeJSExpression,
		scope?: RuntimeScope | boolean
	): unknown;

	parseSchema<T extends object>(
		schema: T,
		scope: RuntimeScope | boolean
	): {
		[K in keyof T]: T[K] extends IPublicTypeI18nData
			? string
			: T[K] extends IPublicTypeJSFunction
				? CallableFunction
				: T[K] extends IPublicTypeJSExpression
					? unknown
					: T[K] extends IPublicTypeJSExpression | IPublicTypeJSFunction
						? CallableFunction | unknown
						: T[K];
	};

	parseSchema<T>(schema: unknown, scope?: RuntimeScope | boolean): T;

	parseSchema(schema: unknown, scope?: RuntimeScope | boolean): unknown {
		if (isJSExpression(schema) || isJSFunction(schema)) {
			return this.parseExpression(schema, scope);
		}
		if (isI18nData(schema)) {
			return this.parseI18n(schema, scope);
		}
		if (isString(schema)) {
			return schema.trim();
		}
		if (isArray(schema)) {
			return schema.map((item) => this.parseSchema(item, scope));
		}
		if (isFunction(schema)) {
			return schema.bind(scope);
		}
		if (isPlainObject(schema)) {
			if (!schema) return schema;
			const res: Record<string, unknown> = {};
			Object.keys(schema).forEach((key) => {
				if (key.startsWith('__')) return;
				res[key] = this.parseSchema(schema[key], scope);
			});
			return res;
		}
		return schema;
	}

	parseOnlyJsValue<T>(schema: unknown): T;

	parseOnlyJsValue(schema: unknown): unknown;

	parseOnlyJsValue(schema: unknown): unknown {
		if (isJSExpression(schema) || isI18nData(schema)) {
			return undefined;
		}
		if (isJSFunction(schema)) {
			return this.parseExpression(schema, false);
		}
		if (isArray(schema)) {
			return schema.map((item) => this.parseOnlyJsValue(item));
		}
		if (isPlainObject(schema)) {
			return Object.keys(schema).reduce(
				(res, key) => {
					if (key.startsWith('__')) return res;
					res[key] = this.parseOnlyJsValue(schema[key]);
					return res;
				},
				{} as Record<string, unknown>
			);
		}
		return schema;
	}

	parseExpression(
		str: IPublicTypeJSFunction,
		scope?: RuntimeScope | boolean
	): CallableFunction;

	parseExpression(
		str: IPublicTypeJSExpression,
		scope?: RuntimeScope | boolean
	): unknown;

	parseExpression(
		str: IPublicTypeJSExpression | IPublicTypeJSFunction,
		scope?: RuntimeScope | boolean
	): CallableFunction | unknown;

	parseExpression(
		str: IPublicTypeJSExpression | IPublicTypeJSFunction,
		scope?: RuntimeScope | boolean
	): CallableFunction | unknown {
		try {
			const contextArr = ['"use strict";'];
			let tarStr: string;
			tarStr = (str.value || '').trim();
			// 替换this关键字
			if (scope !== false && !tarStr.match(/^\([^)]*\)\s*=>/)) {
				tarStr = tarStr.replace(
					/this(\W|$)/g,
					(_a: string, b: string) => `__self${b}`
				);
				contextArr.push('var __self = arguments[1];');
			}
			contextArr.push('return ');
			tarStr = contextArr.join('\n') + tarStr;
			const fn = this.createFunction(tarStr);
			return fn(this.exports, scope || {});
		} catch (error) {
			// eslint-disable-next-line no-console
			console.warn('parseExpression.error', error, str);
			return undefined;
		}
	}

	/**
	 * 解析作用域插槽的参数,将传入的实参和形参映射成一个作用域对象
	 *
	 * @param args - 调用插槽时传入的实际参数数组
	 * @param params - 插槽定义的形参名称数组
	 * @returns 包含参数映射的作用域对象
	 *
	 * @example
	 * ```ts
	 * // 插槽定义: <template #default="{ item, index }">
	 * parseSlotScope(['data', 0], ['item', 'index'])
	 * // 返回: { item: 'data', index: 0 }
	 * ```
	 *
	 * @description
	 * - 该函数用于处理作用域插槽(Scoped Slots)的参数传递
	 * - 会将实参按顺序映射到对应的形参名上
	 * - 若实参少于形参,多余的形参值为 undefined
	 * - 若实参多于形参,多余的实参会被忽略
	 */
	parseSlotScope(args: unknown[], params: string[]): BlockScope {
		const slotParams: BlockScope = {};
		ensureArray(params).forEach((item, idx) => {
			slotParams[item] = args[idx];
		});
		return slotParams;
	}
}

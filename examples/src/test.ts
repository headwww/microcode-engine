import {
	IPublicTypeJSExpression,
	IPublicTypeJSFunction,
} from '@arvin-shu/microcode-types';

export interface SchemaParserOptions {
	thisRequired?: boolean;
}

export class SchemaParser {
	private createFunction: (code: string) => CallableFunction;

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

	parseExpression(
		str: IPublicTypeJSFunction,
		scope?: any | boolean
	): CallableFunction;

	parseExpression(str: IPublicTypeJSExpression, scope?: any | boolean): unknown;

	parseExpression(
		str: IPublicTypeJSExpression | IPublicTypeJSFunction,
		scope?: any | boolean
	): CallableFunction | unknown;

	parseExpression(
		str: IPublicTypeJSExpression | IPublicTypeJSFunction,
		scope?: any | boolean
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
}

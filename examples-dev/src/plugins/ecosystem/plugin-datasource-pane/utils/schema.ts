import { isJSFunction } from '@arvin-shu/microcode-utils';
import { InterpretDataSourceConfig } from '@arvin-shu/microcode-datasource-types';
import { isPlainObject, isArray } from 'lodash-es';

export const DATASOURCE_HANDLER_NAME_LIST = [
	'dataHandler',
	'errorHandler',
	'willFetch',
	'shouldFetch',
];

/**
 * 协议是否合法
 * @param schema 协议
 */
export function isSchemaValid(schema: any) {
	if (!isPlainObject(schema)) return false;
	if (schema.list && !isArray(schema.list)) return false;
	if (isArray(schema?.list)) {
		return schema.list.every((dataSource: InterpretDataSourceConfig) =>
			DATASOURCE_HANDLER_NAME_LIST.every((dataSourceHandlerName) => {
				if (isJSFunction(dataSource?.[dataSourceHandlerName])) {
					return true;
				}
				if (!(dataSourceHandlerName in dataSource)) {
					return true;
				}
				return false;
			})
		);
	}
	return true;
}

/**
 * 纠正协议
 * @param schema 原协议
 * @param schema 纠正后的协议
 */
export function correctSchema(schema: any) {
	if (!isPlainObject(schema)) return { list: [] };
	const res = {
		...schema,
	};
	if (isArray(res?.list)) {
		res.list = res.list.map((dataSource: InterpretDataSourceConfig) => {
			const nextDataSource = { ...dataSource };
			DATASOURCE_HANDLER_NAME_LIST.forEach((dataSourceHandlerName) => {
				if (
					isJSFunction(nextDataSource?.[dataSourceHandlerName]) &&
					dataSourceHandlerName in nextDataSource
				) {
					delete nextDataSource[dataSourceHandlerName];
				}
			});
			return nextDataSource;
		});
	} else {
		res.list = [];
	}
	return res;
}

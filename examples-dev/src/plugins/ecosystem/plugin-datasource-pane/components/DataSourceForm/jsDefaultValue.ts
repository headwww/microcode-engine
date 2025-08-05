import { InterpretDataSourceConfig as DataSourceConfig } from '@arvin-shu/microcode-datasource-types';
import { cloneDeep } from 'lodash-es';

export const shouldFetch = `function shouldFetch() {
    return true;
}
`;

export const willFetch = `function willFetch(options) {
    return options;
}
`;

export const dataHandler = `function dataHandler(res) { 
	return res
}
`;

export const errorHandler = `function errorHandler(err) {
}   
`;

export const monacoEditorConfigs = [
	{
		label: '是否发起请求',
		key: 'shouldFetch',
		value: {
			type: 'JSFunction',
			value: shouldFetch,
		},
	},
	{
		label: '请求发送前拦截器',
		key: 'willFetch',
		value: {
			type: 'JSFunction',
			value: willFetch,
		},
	},
	{
		label: '请求返回成功处理器',
		key: 'dataHandler',
		value: {
			type: 'JSFunction',
			value: dataHandler,
		},
	},
	{
		label: '请求返回失败处理器',
		key: 'errorHandler',
		value: {
			type: 'JSFunction',
			value: errorHandler,
		},
	},
];

export const transformDataSourceFuncList = (config: DataSourceConfig) => {
	const value = cloneDeep(config);
	const funcList = [];

	if (value.shouldFetch) {
		funcList.push({
			label: '是否发起请求',
			key: 'shouldFetch',
			value: value.shouldFetch,
		});
	}

	if (value.willFetch) {
		funcList.push({
			label: '请求发送前拦截器',
			key: 'willFetch',
			value: value.willFetch,
		});
	}

	if (value.dataHandler) {
		funcList.push({
			label: '请求返回成功处理器',
			key: 'dataHandler',
			value: value.dataHandler,
		});
	}

	if (value.errorHandler) {
		funcList.push({
			label: '请求返回失败处理器',
			key: 'errorHandler',
			value: value.errorHandler,
		});
	}

	return funcList;
};

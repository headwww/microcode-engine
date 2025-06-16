import { clone, cloneDeep } from 'lodash';
import axios, { AxiosResponse, AxiosInstance } from 'axios';
import LTAxios from './Axios';
import { ContentTypeEnum, RequestEnum } from './httpEnum';
import { AxiosTransform } from './axiosTransform';
import { RequestOptions, Result } from './types';
import { checkStatus } from './checkStatus';
import { AxiosRetry } from './axiosRetry';
import { cleanEmptyValues } from './utils';
import { parse } from './fastjson';

export * from './Axios';
export * from './axiosCancel';
export * from './axiosRetry';
export * from './axiosTransform';
export * from './httpEnum';
export * from './types';

const transform: AxiosTransform = {
	transformResponseHook: (
		res: AxiosResponse<Result>,
		options: RequestOptions
	) => {
		const {
			isTransformResponse,
			isReturnNativeResponse,
			fastjson,
			isParameters,
		} = options;
		// 是否返回原生响应头
		if (isReturnNativeResponse !== false) {
			return res;
		}
		// 提取出data或者parameters 默认提取
		if (isTransformResponse !== false) {
			if (isParameters === true) {
				if (fastjson === false) {
					return res.data.parameters;
				}
				return parse(res.data).parameters;
			}
			if (fastjson === false) {
				return res.data.data;
			}
			return parse(res.data).data;
		}

		// 不踢去保留parameters
		// 本项目后端接口没有做统一返回处理，所以无法做下面的操作，
		// 因为所有的报错全部被后端通过try-catch出去了所以只会走responseInterceptorsCatch
		if (fastjson === false) {
			return res.data;
		}
		return parse(res.data);
	},

	beforeRequestHook: (config, options) => {
		// 清除数据，则把data中的空值去掉
		if (!options.noClearData) {
			try {
				config.data = cleanEmptyValues(cloneDeep(config.data));
			} catch (error) {
				// eslint-disable-next-line no-console
				console.error(`http.ts: 清除数据失败: ${error}`);
				return config;
			}
		}
		return config;
	},

	requestInterceptors: (config) => config,

	responseInterceptors: (res: AxiosResponse<any>) => res,

	responseInterceptorsCatch(axiosInstance: AxiosInstance, error: any) {
		const { response, code, config, message } = error || {};
		const msg: string = response?.data?.errorText ?? '';
		const err: string = error?.toString?.() ?? '';
		const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';

		let errMessage;

		if (axios.isCancel(error)) {
			return Promise.reject(error);
		}

		try {
			if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
				errMessage = '接口请求超时，请刷新页面重试！';
			}
			if (err?.includes('Network Error')) {
				errMessage = '网络异常，请检查网络后重试！';
			}
			if (errMessage) {
				if (errorMessageMode === 'modal') {
					console.log('错误提示', errMessage);
				} else if (errorMessageMode === 'message') {
					console.log('错误提示', errMessage);
				}
				return Promise.reject(error);
			}
		} catch (error) {
			throw new Error(error as unknown as string);
		}

		checkStatus(error?.response?.status, msg, errorMessageMode);
		// 添加自动重试机制 保险起见 只针对GET请求
		const retryRequest = new AxiosRetry();
		const { isOpenRetry } = config.requestOptions.retryRequest;
		config.method?.toUpperCase() === RequestEnum.GET &&
			isOpenRetry &&
			retryRequest.retry(axiosInstance, error);
		return Promise.reject(error);
	},
};

export const http = new LTAxios({
	// 基础请求地址
	baseURL: '/',
	// 配置公共请求头
	headers: {
		'Content-Type': ContentTypeEnum.JSON,
		Accept: 'application/json',
	},
	// 请求超时时常
	timeout: 60 * 1000,
	// 数据转换
	transform: clone(transform),
	requestOptions: {
		// 忽略重复请求
		ignoreCancelToken: true,
		// 是否返回原生响应头 比如：需要获取响应头时使用该属性
		isReturnNativeResponse: false,
		// 需要对返回数据进行处理
		// isTransformResponse: true,
		// 消息提示类型
		errorMessageMode: 'notification',
		retryRequest: {
			// 请求重试机制配置
			isOpenRetry: false,
			// 重试次数
			count: 5,
			// 重试等待时间
			waitTime: 100,
		},
	},
});

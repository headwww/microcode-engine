import type {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';
import type { RequestOptions, Result } from './types';

/**
 * 用于创建 Axios 实例的选项配置接口，继承了 AxiosRequestConfig。
 */
export interface CreateAxiosOptions extends AxiosRequestConfig {
	/**
	 * 自定义的 Axios 请求和响应的转换和拦截器。
	 */
	transform?: AxiosTransform;

	/**
	 * 请求选项配置，用于自定义请求行为。
	 */
	requestOptions?: RequestOptions;
}

/**
 * Axios 请求和响应的转换和拦截器抽象类
 */
export abstract class AxiosTransform {
	/**
	 * 在发出 Axios 请求之前执行的钩子函数。
	 * @param config Axios 请求配置
	 * @param options 请求选项配置
	 * @returns Axios 请求配置
	 */
	beforeRequestHook?: (
		config: AxiosRequestConfig,
		options: RequestOptions
	) => AxiosRequestConfig;

	/**
	 * 在处理 Axios 响应数据之前执行的钩子函数。
	 * @param res Axios 响应对象
	 * @param options 请求选项配置
	 * @returns 处理后的响应数据
	 */
	transformResponseHook?: (
		res: AxiosResponse<Result>,
		options: RequestOptions
	) => any;

	/**
	 * 请求发生错误时执行的钩子函数。
	 * @param e 错误对象
	 * @param options 请求选项配置
	 * @returns 一个 Promise，用于处理请求错误
	 */
	requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;

	/**
	 * 请求拦截器，用于在发出 Axios 请求前自定义修改请求配置。
	 * @param config Axios 请求配置
	 * @param options Axios 实例的选项配置
	 * @returns 修改后的 Axios 请求配置
	 */
	requestInterceptors?: (
		config: InternalAxiosRequestConfig,
		options: CreateAxiosOptions
	) => InternalAxiosRequestConfig;

	/**
	 * 响应拦截器，用于在处理 Axios 响应时自定义修改响应数据。
	 * @param res Axios 响应对象
	 * @returns 修改后的 Axios 响应对象
	 */
	responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;

	/**
	 * 请求拦截器发生错误时执行的钩子函数。
	 * @param error 错误对象
	 */
	requestInterceptorsCatch?: (error: Error) => void;

	/**
	 * 响应拦截器发生错误时执行的钩子函数。
	 * @param axiosInstance Axios 实例
	 * @param error 错误对象
	 */
	responseInterceptorsCatch?: (
		axiosInstance: AxiosInstance,
		error: Error
	) => void;
}

import axios, {
	AxiosError,
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from 'axios';
import { cloneDeep, isFunction } from 'lodash-es';
import qs from 'qs';
import { CreateAxiosOptions } from './axiosTransform';
import type { RequestOptions, Result } from './types';
import { ContentTypeEnum, RequestEnum } from './httpEnum';
import { AxiosCanceler } from './axiosCancel';

export class LTAxios {
	private axiosInstance: AxiosInstance;

	private readonly options: CreateAxiosOptions;

	constructor(options: CreateAxiosOptions) {
		this.options = options;
		this.axiosInstance = axios.create(options);
		this.setupInterceptors();
	}

	private createAxios(config: CreateAxiosOptions): void {
		this.axiosInstance = axios.create(config);
	}

	private getTransform() {
		const { transform } = this.options;
		return transform;
	}

	getAxios(): AxiosInstance {
		return this.axiosInstance;
	}

	configAxios(config: CreateAxiosOptions) {
		if (!this.axiosInstance) {
			return;
		}
		this.createAxios(config);
	}

	setHeader(headers: any): void {
		if (!this.axiosInstance) {
			return;
		}
		Object.assign(this.axiosInstance.defaults.headers, headers);
	}

	private setupInterceptors() {
		const {
			axiosInstance,
			options: { transform },
		} = this;
		if (!transform) {
			return;
		}
		const {
			requestInterceptors,
			requestInterceptorsCatch,
			responseInterceptors,
			responseInterceptorsCatch,
		} = transform;

		const axiosCanceler = new AxiosCanceler();

		this.axiosInstance.interceptors.request.use(
			(config: InternalAxiosRequestConfig) => {
				const requestOptions =
					(config as unknown as any).requestOptions ??
					this.options.requestOptions;
				const ignoreCancelToken = requestOptions?.ignoreCancelToken ?? true;

				!ignoreCancelToken && axiosCanceler.addPending(config);

				if (requestInterceptors && isFunction(requestInterceptors)) {
					config = requestInterceptors(config, this.options);
				}
				return config;
			},
			undefined
		);

		requestInterceptorsCatch &&
			isFunction(requestInterceptorsCatch) &&
			this.axiosInstance.interceptors.request.use(
				undefined,
				requestInterceptorsCatch
			);

		this.axiosInstance.interceptors.response.use((res: AxiosResponse<any>) => {
			res && axiosCanceler.removePending(res.config);
			if (responseInterceptors && isFunction(responseInterceptors)) {
				res = responseInterceptors(res);
			}
			return res;
		}, undefined);

		responseInterceptorsCatch &&
			isFunction(responseInterceptorsCatch) &&
			this.axiosInstance.interceptors.response.use(undefined, (error) =>
				responseInterceptorsCatch(axiosInstance, error)
			);
	}

	supportFormData(config: AxiosRequestConfig) {
		const headers = config.headers || this.options.headers;
		const contentType = headers?.['Content-Type'] || headers?.['content-type'];

		if (
			contentType !== ContentTypeEnum.FORM_URLENCODED ||
			!Reflect.has(config, 'data') ||
			config.method?.toUpperCase() === RequestEnum.GET
		) {
			return config;
		}

		return {
			...config,
			data: qs.stringify(config.data, { arrayFormat: 'brackets' }),
		};
	}

	get<T = any>(
		config: AxiosRequestConfig,
		options?: RequestOptions
	): Promise<T> {
		return this.request<T>({ ...config, method: RequestEnum.GET }, options);
	}

	post<T = any>(
		config: AxiosRequestConfig,
		options?: RequestOptions
	): Promise<T> {
		return this.request<T>({ ...config, method: RequestEnum.POST }, options);
	}

	put<T = any>(
		config: AxiosRequestConfig,
		options?: RequestOptions
	): Promise<T> {
		return this.request<T>({ ...config, method: RequestEnum.PUT }, options);
	}

	delete<T = any>(
		config: AxiosRequestConfig,
		options?: RequestOptions
	): Promise<T> {
		return this.request<T>({ ...config, method: RequestEnum.DELETE }, options);
	}

	request<T = any>(
		config: AxiosRequestConfig,
		options?: RequestOptions
	): Promise<T> {
		let conf: CreateAxiosOptions = cloneDeep(config);
		// cancelToken 如果被深拷贝，会导致最外层无法使用cancel方法来取消请求
		if (config.cancelToken) {
			conf.cancelToken = config.cancelToken;
		}

		if (config.signal) {
			conf.signal = config.signal;
		}

		const transform = this.getTransform();

		const { requestOptions } = this.options;

		const opt: RequestOptions = { ...requestOptions, ...options };

		const { beforeRequestHook, requestCatchHook, transformResponseHook } =
			transform || {};
		if (beforeRequestHook && isFunction(beforeRequestHook)) {
			conf = beforeRequestHook(conf, opt);
		}
		conf.requestOptions = opt;

		conf = this.supportFormData(conf);

		return new Promise((resolve, reject) => {
			this.axiosInstance
				.request<any, AxiosResponse<Result>>(conf)
				.then((res: AxiosResponse<Result>) => {
					if (transformResponseHook && isFunction(transformResponseHook)) {
						try {
							const ret = transformResponseHook(res, opt);

							resolve(ret);
						} catch (err) {
							reject(err || new Error('request error!'));
						}
						return;
					}
					resolve(res as unknown as Promise<T>);
				})
				.catch((e: Error | AxiosError) => {
					if (requestCatchHook && isFunction(requestCatchHook)) {
						reject(requestCatchHook(e, opt));
						return;
					}
					if (axios.isAxiosError(e)) {
						// rewrite error message from axios in here
					}
					reject(e);
				});
		});
	}
}
export default LTAxios;

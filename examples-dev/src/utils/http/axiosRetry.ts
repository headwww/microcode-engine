import type { AxiosError, AxiosInstance } from 'axios';
/**
 * Axios 重试类
 * 提供处理 Axios 请求重试的方法
 */
export class AxiosRetry {
	/**
	 * 处理请求重试的方法
	 * @param axiosInstance Axios 实例
	 * @param error Axios 错误对象
	 * @returns 返回一个 Promise，用于进行重试或拒绝请求
	 */
	retry(axiosInstance: AxiosInstance, error: AxiosError) {
		const { config } = error.response as any;
		const { waitTime, count } = config?.requestOptions?.retryRequest ?? {};
		config.retryCount = config.retryCount || 0;
		if (config.retryCount >= count) {
			return Promise.reject(error);
		}
		config.retryCount += 1;
		delete config.headers;
		return this.delay(waitTime).then(() => axiosInstance(config));
	}

	/**
	 * 延迟一定时间的方法
	 * @param waitTime 延迟的时间（毫秒）
	 * @returns 返回一个 Promise，用于延迟指定的时间
	 */
	delay(waitTime: number) {
		return new Promise((resolve) => {
			setTimeout(resolve, waitTime);
		});
	}
}

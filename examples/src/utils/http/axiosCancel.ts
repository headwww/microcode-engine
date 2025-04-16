import type { AxiosRequestConfig } from 'axios';

// 存储当前所有待处理请求的 AbortController
const pendingMap = new Map<string, AbortController>();

// 生成请求的唯一标识符（URL + Method）
const getPendingUrl = (config: AxiosRequestConfig): string =>
	[config.method, config.url].join('&');

/**
 * Axios 请求取消器类
 * 提供用于处理取消请求的方法
 */
export class AxiosCanceler {
	/**
	 * 添加待处理请求到 Map 中
	 * @param config Axios 请求配置对象
	 */
	public addPending(config: AxiosRequestConfig): void {
		// 先移除相同请求的已有记录，确保不重复添加
		this.removePending(config);

		const url = getPendingUrl(config);
		const controller = new AbortController();
		config.signal = config.signal || controller.signal;

		// 如果当前请求不在等待中，将其添加到等待中
		if (!pendingMap.has(url)) {
			pendingMap.set(url, controller);
		}
	}

	/**
	 * 移除所有待处理请求，同时取消请求
	 */
	public removeAllPending(): void {
		pendingMap.forEach((abortController) => {
			if (abortController) {
				abortController.abort();
			}
		});
		this.reset();
	}

	/**
	 * 移除指定请求的待处理记录，并取消请求
	 * @param config Axios 请求配置对象
	 */
	public removePending(config: AxiosRequestConfig): void {
		const url = getPendingUrl(config);
		if (pendingMap.has(url)) {
			const abortController = pendingMap.get(url);
			if (abortController) {
				abortController.abort(url);
			}
			pendingMap.delete(url);
		}
	}

	/**
	 * 重置待处理请求的 Map
	 */
	public reset(): void {
		pendingMap.clear();
	}
}

/**
 * 请求报错时的提示方式
 */
export type ErrorMessageMode =
	| 'none'
	| 'modal'
	| 'message'
	| 'notification'
	| undefined;

/**
 * 请求成功时的提示方式
 */
export type SuccessMessageMode = ErrorMessageMode;

/**
 * 请求重试
 */
export interface RetryRequest {
	// 是否开启请求重试
	isOpenRetry: boolean;
	// 重试次数
	count: number;
	// 重试等待时间
	waitTime: number;
}

/**
 * 请求参数配置
 */
export interface RequestOptions {
	// 是否处理请求结果
	isTransformResponse?: boolean;
	// 是否返回原生响应头
	// 例如：在需要获取响应头时使用该属性
	isReturnNativeResponse?: boolean;
	// 是否携带parameters
	isParameters?: boolean;
	// 错误消息提示类型
	errorMessageMode?: ErrorMessageMode;
	// 成功消息提示类型
	successMessageMode?: SuccessMessageMode;
	//  忽略重复请求
	ignoreCancelToken?: boolean;
	// 请求重试机制配置
	retryRequest?: RetryRequest;
	// 是否是循环引用的返回值，需要解决fastjson的循环引用bug，默认开启
	fastjson?: boolean;
	// 清理对象或数组中的空值，但保持数组索引位置 默认 false,
	noClearData?: boolean;
}

/**
 * 统一返回格式
 *
 */
export interface Result<T = any> {
	// // 响应码
	// code: number;
	// // 响应类型，可以是'success'、'error'或'warning'
	// type: 'success' | 'error' | 'warning';
	// // 响应消息
	// message: string;
	// // 响应数据
	// result: T;

	// 提交成功后返回请求时候的参数，这个参数由后端产生id字段
	parameters: T;
	// 返回的数据
	data: T;
	// 是否请求成功
	success: boolean;
	// 错误编码
	errorCode: number;
	// 错误提示
	errorText: string;
	// 系统级别错误
	throwable: string;
}

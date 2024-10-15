export interface IPublicModelPreference {
	/**
	 * 将某个值存储到本地存储中。可以选择性地按模块划分存储，模块用于区分不同功能或上下文的偏好。
	 */
	set(key: string, value: any, module?: string): void;

	/**
	 * 从本地存储中获取指定模块和键对应的值。
	 */
	get(key: string, module: string): any;

	/**
	 * 检查本地存储中是否包含指定模块和键对应的值。
	 */
	contains(key: string, module: string): boolean;
}

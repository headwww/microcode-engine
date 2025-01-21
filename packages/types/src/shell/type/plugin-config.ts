/**
 * 插件配置接口
 */
export interface IPublicTypePluginConfig {
	/**
	 * 初始化插件
	 * @returns 返回一个 Promise 或者 void
	 */
	init(): Promise<void> | void;

	/**
	 * 销毁插件
	 * 可选方法
	 * @returns 返回一个 Promise 或者 void
	 */
	destroy?(): Promise<void> | void;

	/**
	 * 导出插件的内容
	 * 可选方法
	 * @returns 返回任意类型的内容
	 */
	exports?(): any;
}

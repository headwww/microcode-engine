export interface IPublicTypePluginRegisterOptions {
	/**
	 * 如果设置为 true，则注册的插件会在注册时立即初始化。这意味着插件会被立即激活，而不是等到插件管理器的 init 方法被调用时才进行初始化。
	 * 当插件在插件管理器初始化之后被注册时，这个选项特别有用。通过设置 autoInit 为 true，你可以确保插件在注册的同时也能正常工作，而不需要等待整个插件管理器的初始化流程完成。
	 */
	autoInit?: boolean;

	/**
	 * 该选项控制是否允许覆盖已经存在的同名插件。如果设置为 true，则在注册新插件时，如果插件名称已存在，会覆盖原有的插件。
	 */
	override?: boolean;
}

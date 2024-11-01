export interface IPublicTypeEditorRegisterOptions {
	/**
	 * default: true
	 */
	singleton?: boolean;

	/**
	 * 如果 autoNew 为 true，注册的数据是一个类，则会自动实例化该类。
	 * 如果注册的数据是一个函数，则会延迟执行该函数（通常在首次调用时才会执行）。
	 * 如果 autoNew 为 false，类不会自动实例化，函数也不会自动执行。
	 */
	autoNew?: boolean;
}

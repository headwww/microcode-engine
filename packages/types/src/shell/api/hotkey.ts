import {
	IPublicTypeDisposable,
	IPublicTypeHotkeyCallback,
	IPublicTypeHotkeyCallbacks,
} from '../type';

export interface IPublicApiHotkey {
	/**
	 * 获取当前快捷键配置
	 *
	 */
	get callbacks(): IPublicTypeHotkeyCallbacks;

	/**
	 * 绑定快捷键
	 * @param combos 快捷键，格式如：['command + s'] 、['ctrl + shift + s'] 等
	 * @param callback 回调函数
	 * @param action
	 */
	bind(
		combos: string[] | string,
		callback: IPublicTypeHotkeyCallback,
		action?: string
	): IPublicTypeDisposable;
}

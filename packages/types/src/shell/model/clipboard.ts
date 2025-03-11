export interface IPublicModelClipboard {
	/**
	 * 给剪贴板赋值
	 */
	setData(data: any): void;

	/**
	 * 设置剪贴板数据设置的回调
	 */
	waitPasteData(
		keyboardEvent: KeyboardEvent,
		cb: (data: any, clipboardEvent: ClipboardEvent) => void
	): void;
}

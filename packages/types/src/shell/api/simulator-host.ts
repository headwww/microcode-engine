import { IPublicModelNode, IPublicModelSimulatorRender } from '../model';

export interface IPublicApiSimulatorHost {
	/**
	 * 获取 contentWindow
	 * @experimental 不稳定的 API,使用时需要额外注意
	 */
	get contentWindow(): Window | undefined;

	/**
	 * 获取 contentDocument
	 * @experimental 不稳定的 API,使用时需要额外注意
	 */
	get contentDocument(): Document | undefined;

	/**
	 * @experimental 不稳定的 API,使用时需要额外注意
	 */
	get renderer(): IPublicModelSimulatorRender | undefined;

	/**
	 * 设置若干用于画布渲染的变量，比如画布大小、locale 等。
	 * @param key
	 * @param value
	 */
	set(key: string, value: any): void;

	/**
	 * 获取模拟器中设置的变量，比如画布大小、locale 等。
	 * @param key
	 * @returns
	 */
	get(key: string): any;

	/**
	 * 滚动到指定节点
	 * @param node
	 * @since v1.1.0
	 */
	scrollToNode(node: IPublicModelNode): void;

	/**
	 * 刷新渲染画布
	 */
	rerender(): void;
}

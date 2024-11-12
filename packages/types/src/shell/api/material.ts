import {
	IPublicTypeAssetsJson,
	IPublicTypeDisposable,
} from '@arvin/microcode-types';

export interface IPublicApiMaterial {
	/**
	 * 设置「资产包」结构
	 *
	 * @returns void
	 */
	setAssets(assets: IPublicTypeAssetsJson): Promise<void>;

	/**
	 * 获取「资产包」结构
	 *
	 * @returns IPublicTypeAssetsJson
	 */
	getAssets(): IPublicTypeAssetsJson | undefined;

	/**
	 * 监听 assets 变化的事件
	 * add callback for assets changed event
	 * @param fn
	 */
	onChangeAssets(fn: () => void): IPublicTypeDisposable;
}

import { IPublicTypeAssetsJson } from '@arvin/microcode-types';

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
}

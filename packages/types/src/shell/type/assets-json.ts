/**
 * 资产包协议
 */

import { IPublicTypeComponentDescription } from './component-description';

export interface IPublicTypeAssetsJson {
	/**
	 * 资产包协议版本号
	 */
	version: string;

	/**
	 * 所有组件的描述协议列表所有组件的列表
	 */
	components: Array<IPublicTypeComponentDescription>;
}

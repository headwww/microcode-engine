import { IPublicTypeComponentDescription } from './component-description';
import { IPublicTypeComponentSort } from './component-sort';
import { IPublicTypePackage } from './package';
import { IPublicTypeRemoteComponentDescription } from './remote-component-description';

/**
 * 资产包协议
 */
export interface IPublicTypeAssetsJson {
	/**
	 * 资产包协议版本号
	 */
	version: string;

	/**
	 *  低代码编辑器中加载的资源列表
	 */
	packages?: IPublicTypePackage[];

	/**
	 * 所有组件的描述协议列表所有组件的列表,本地协议和远程协议
	 */
	components: Array<
		IPublicTypeComponentDescription | IPublicTypeRemoteComponentDescription
	>;

	/**
	 * 用于描述组件面板中的 tab 和 category
	 */
	sort?: IPublicTypeComponentSort;
}

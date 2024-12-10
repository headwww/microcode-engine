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
	 *  packages中的资源是在渲染器中加载的依赖
	 */
	packages?: IPublicTypePackage[];

	/**
	 * 所有组件的描述协议列表所有组件的列表,本地协议和远程协议
	 * 通过editor.setAssets解析，解析完格式IPublicTypeComponentMetadata用于后期组件元数据实例的构建
	 */
	components: Array<
		IPublicTypeComponentDescription | IPublicTypeRemoteComponentDescription
	>;

	/**
	 * 用于描述组件面板中的 tab 和 category
	 */
	sort?: IPublicTypeComponentSort;
}

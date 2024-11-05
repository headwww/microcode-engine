import { Asset } from '../../assets';
import { IPublicTypeComponentMetadata } from './component-metadata';
/**
 * 远程物料描述
 */
export interface IPublicTypeRemoteComponentDescription
	extends IPublicTypeComponentMetadata {
	/**
	 * 组件描述导出名字，可以通过 window[exportName] 获取到组件描述的 Object 内容；
	 */
	exportName?: string;

	/**
	 * 组件描述的资源链接；
	 */
	url?: Asset;
}

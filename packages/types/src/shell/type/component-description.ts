import { IPublicTypeComponentMetadata } from './component-metadata';
import { IPublicTypeReference } from './reference';

/**
 * 本地物料描述
 */
export interface IPublicTypeComponentDescription
	extends IPublicTypeComponentMetadata {
	/**
	 * 关键字
	 */
	keywords: string[];

	/**
	 * 替代 npm 字段的升级版本
	 */
	reference?: IPublicTypeReference;
}

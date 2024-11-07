import { IPublicModelDragon } from '../model';

/**
 * canvas - 画布 API
 */
export interface IPublicApiCanvas {
	/**
	 * 获取拖拽操作对象的实例
	 *
	 */
	get dragon(): IPublicModelDragon | null;
}

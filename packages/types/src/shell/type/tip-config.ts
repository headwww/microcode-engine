import { VNode } from 'vue';
import { IPublicTypeI18nData } from './i8n-data';

export interface IPublicTypeTipConfig {
	/**
	 * className
	 */
	className?: string;

	/**
	 * tip 的内容
	 */
	children?: IPublicTypeI18nData | VNode;
	theme?: string;

	/**
	 * tip 的方向
	 */
	direction?: 'top' | 'bottom' | 'left' | 'right';
}

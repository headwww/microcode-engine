import { IPublicTypeNpmInfo } from './npm-info';

export interface IPublicTypeLowCodeComponent {
	/**
	 * 研发模式
	 */
	devMode: 'microCode';
	/**
	 * 组件名称
	 */
	componentName: string;
}

export type IPublicTypeProCodeComponent = IPublicTypeNpmInfo;
export type IPublicTypeComponentMap =
	| IPublicTypeProCodeComponent
	| IPublicTypeLowCodeComponent;
export type IPublicTypeComponentsMap = IPublicTypeComponentMap[];

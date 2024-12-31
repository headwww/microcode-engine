import { IPublicTypeNpmInfo } from './npm-info';

export interface IPublicTypeMicrocodeComponent {
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
	| IPublicTypeMicrocodeComponent;
export type IPublicTypeComponentsMap = IPublicTypeComponentMap[];

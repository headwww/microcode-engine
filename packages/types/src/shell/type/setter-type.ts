import { IPublicTypeCustomView } from './custom-view';
import { IPublicTypeSetterConfig } from './setter-config';

export type IPublicTypeSetterType =
	| IPublicTypeSetterConfig
	| IPublicTypeSetterConfig[]
	| string
	| IPublicTypeCustomView;

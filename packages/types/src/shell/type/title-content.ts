import { VNode } from 'vue';
import { IPublicTypeTitleConfig } from './title-config';
import { IPublicTypeI18nData } from './i8n-data';

export type IPublicTypeTitleContent =
	| string
	| IPublicTypeI18nData
	| VNode
	| IPublicTypeTitleConfig;

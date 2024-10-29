import { VNode } from 'vue';
import { IPublicTypeI18nData } from '..';
import { IPublicTypeTipConfig } from './tip-config';

export type TipContent =
	| string
	| IPublicTypeI18nData
	| VNode
	| IPublicTypeTipConfig;

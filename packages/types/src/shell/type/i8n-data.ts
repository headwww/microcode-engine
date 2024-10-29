import { VNode } from 'vue';

export interface IPublicTypeI18nData {
	type: 'i18n';
	intl?: string | VNode;
	[key: string]: any;
}

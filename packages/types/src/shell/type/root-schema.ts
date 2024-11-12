import { IPublicTypeBlockSchema } from './block-schema';
import { IPublicTypeComponentSchema } from './component-schema';
import { IPublicTypePageSchema } from './page-schema';

export type IPublicTypeRootSchema =
	| IPublicTypePageSchema
	| IPublicTypeComponentSchema
	| IPublicTypeBlockSchema;

import { INode } from '@arvin-shu/microcode-designer';
import {
	I18nMessages,
	IPublicTypeContainerSchema,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import {
	Component,
	ComponentPublicInstance,
	DefineComponent,
	ExtractPropTypes,
	PropType,
} from 'vue';
import { RequestHandler } from '@arvin-shu/microcode-datasource-types';
import { BlockScope, SchemaParser } from '../utils';

export const rendererProps = {
	__scope: {
		type: Object as PropType<BlockScope>,
		default: undefined,
	},
	__schema: {
		type: Object as PropType<IPublicTypeContainerSchema>,
		required: true,
	},
	__designMode: {
		type: String as PropType<'live' | 'design'>,
		default: 'live',
	},
	__appHelper: {
		type: Object as PropType<Record<string, unknown>>,
		default: () => ({}),
	},
	__components: {
		type: Object as PropType<Record<string, Component>>,
		required: true,
	},
	__getNode: {
		type: Function as PropType<(id: string) => INode | null>,
		required: true,
	},
	__locale: {
		type: String,
		default: undefined,
	},
	__messages: {
		type: Object as PropType<I18nMessages>,
		default: () => ({}),
	},
	__triggerCompGetCtx: {
		type: Function as PropType<
			(schema: IPublicTypeNodeSchema, ref: ComponentPublicInstance) => void
		>,
		required: true,
	},
	__thisRequiredInJSE: {
		type: Boolean,
		default: true,
	},
	__requestHandlersMap: {
		type: Object as PropType<Record<string, RequestHandler>>,
		default: () => ({}),
	},
	__props: {
		type: Object,
		default: () => ({}),
	},
	__parser: {
		type: Object as PropType<SchemaParser>,
		required: true,
	},
} as const;

export type RendererProps = ExtractPropTypes<typeof rendererProps>;

export type RendererComponent = DefineComponent<RendererProps, any, any>;

export const leafProps = {
	__comp: null,
	__scope: null,
	__schema: {
		type: Object as PropType<IPublicTypeNodeSchema>,
		default: () => ({}),
	},
	__vnodeProps: {
		type: Object as PropType<Record<string, unknown>>,
		default: () => ({}),
	},
	__isRootNode: Boolean,
} as const;

export type LeafProps = ExtractPropTypes<typeof leafProps>;
export const leafPropKeys = Object.keys(leafProps) as (keyof LeafProps)[];

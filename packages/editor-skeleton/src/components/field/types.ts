import { ExtractPropTypes, PropType } from 'vue';
import {
	IPublicModelEditor,
	IPublicTypeTitleContent,
} from '@arvin-shu/microcode-types';

export const fieldProps = {
	title: [Object, String] as PropType<IPublicTypeTitleContent | string>,
	defaultDisplay: {
		type: String as PropType<
			'accordion' | 'inline' | 'block' | 'plain' | 'popup' | 'entry'
		>,
	},
	className: String,
	onExpandChange: Function as PropType<(expandState: boolean) => void>,
	collapsed: Boolean,
	tip: [
		Object,
		String,
		Number,
		Boolean,
		Array,
		Function,
		Symbol,
	] as PropType<any>,
	name: String,
	onClear: Function as PropType<() => void>,
	editor: Object as PropType<IPublicModelEditor>,
	meta: [Object, String] as PropType<
		{ package: string; componentName: string } | string
	>,
} as const;

export type FieldProps = ExtractPropTypes<typeof fieldProps>;

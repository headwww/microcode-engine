import {
	IPublicTypeI18nData,
	IPublicTypeTipConfig,
} from '@arvin-shu/microcode-types';
import { uniqueId } from '@arvin-shu/microcode-utils';
import { defineComponent, onUnmounted, PropType, VNode } from 'vue';
import { postTip } from './tip-handler';

export const Tip = defineComponent({
	name: 'Tip',
	props: {
		className: String,
		children: [Object, String] as PropType<
			IPublicTypeI18nData | VNode | string
		>,
		theme: String,
		direction: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
	},
	setup(props: IPublicTypeTipConfig, { slots }) {
		const id = uniqueId('tips$');
		onUnmounted(() => {
			postTip(id, null);
		});

		return () => {
			postTip(id, {
				...props,
				children: props.children ? props.children : (slots.default?.() as any),
			});
			return <meta data-role="tip" data-tip-id={id}></meta>;
		};
	},
});

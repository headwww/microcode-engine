import {
	IPublicTypeI18nData,
	IPublicTypeTipConfig,
} from '@arvin/microcode-types';
import { uniqueId } from '@arvin/microcode-utils';
import { defineComponent, onUnmounted, PropType, VNode } from 'vue';
import { postTip } from './tip-handler';

export const Tip = defineComponent({
	name: 'Tip',
	props: {
		className: String,
		children: [Object, String] as PropType<IPublicTypeI18nData | VNode>,
		theme: String,
		direction: String as PropType<'top' | 'bottom' | 'left' | 'right'>,
	},
	setup(props: IPublicTypeTipConfig) {
		const id = uniqueId('tips$');
		onUnmounted(() => {
			postTip(id, null);
		});

		return () => {
			postTip(id, props);
			return <meta data-role="tip" data-tip-id={id}></meta>;
		};
	},
});

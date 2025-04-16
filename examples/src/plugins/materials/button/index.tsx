import { defineComponent, PropType } from 'vue';
import { Button as AntButton } from 'ant-design-vue';

export default defineComponent({
	name: 'LtButton',
	props: {
		href: {
			type: String,
			default: '',
		},
		// eslint-disable-next-line vue/prop-name-casing
		__designMode: {
			type: String as PropType<'design' | 'live'>,
			default: 'live',
		},
	},
	setup(props, { slots }) {
		const innerProps: Record<string, any> = {};

		if (!props.href?.trim() || props.__designMode === 'design') {
			// 解决低代码编辑器中按钮设置href属性造成按钮点击重定向问题
			innerProps.href = undefined;
		}

		return () => <AntButton {...innerProps}>{slots.default?.()}</AntButton>;
	},
});

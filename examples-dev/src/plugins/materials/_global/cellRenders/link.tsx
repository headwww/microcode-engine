import { defineComponent, PropType } from 'vue';

export default defineComponent({
	componentName: 'LtLinkRenderTableCell',
	props: {
		params: Object as PropType<any>,
		onLinkClick: Function as PropType<(params: any) => void>,
	},
	setup(props, { slots }) {
		return () => (
			<span
				style={{ color: '#1677ff', cursor: 'pointer' }}
				onClick={() => {
					props.onLinkClick?.(props.params);
				}}
			>
				{slots.default?.()}
			</span>
		);
	},
});

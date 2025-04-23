import { defineComponent } from 'vue';

export default defineComponent({
	componentName: 'LtLinkRenderTableCell',
	setup(props, { slots }) {
		return () => (
			<span style={{ color: '#1677ff', cursor: 'pointer' }}>
				{slots.default?.()}
			</span>
		);
	},
});

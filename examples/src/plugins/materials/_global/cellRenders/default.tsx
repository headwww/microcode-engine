import { defineComponent } from 'vue';

export default defineComponent({
	componentName: 'LtDefaultRenderTableCell',
	setup(props, { slots }) {
		return () => (
			<span style={{ cursor: 'text', userSelect: 'text' }}>
				{slots.default?.()}
			</span>
		);
	},
});

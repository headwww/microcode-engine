import { defineComponent } from 'vue';

export default defineComponent({
	componentName: 'LtDefaultRenderTableCell',
	setup(props, { slots }) {
		return () => <span>{slots.default?.()}</span>;
	},
});

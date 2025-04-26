import { defineComponent } from 'vue';

export default defineComponent({
	name: 'LtLayout',
	setup(props, { slots }) {
		return () => <div>{slots.default?.()}</div>;
	},
});

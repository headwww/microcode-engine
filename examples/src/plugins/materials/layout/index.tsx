import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Layout',
	setup(props, { slots }) {
		return () => <div>{slots.default?.()}</div>;
	},
});

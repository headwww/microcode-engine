import { defineComponent } from 'vue';

export const FCell = defineComponent({
	name: 'FCell',
	props: {},
	setup(props, { slots }) {
		return () => <div>{slots.default?.()}</div>;
	},
});

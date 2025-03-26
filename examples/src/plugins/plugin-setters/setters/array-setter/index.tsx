import { defineComponent } from 'vue';

export const ArraySetter = defineComponent({
	name: 'ArraySetter',
	inheritAttrs: false,
	props: {
		value: null,
	},
	setup() {
		return () => <div></div>;
	},
});

import { defineComponent, toRaw, h } from 'vue';
import { leafProps } from '../base';

export const Hoc = defineComponent({
	name: 'Hoc',
	inheritAttrs: false,
	props: leafProps,
	setup(props) {
		return () => {
			const comp = toRaw(props.__comp);
			return h(comp);
		};
	},
});

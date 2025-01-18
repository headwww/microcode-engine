import { defineComponent, PropType } from 'vue';
import { BuiltinSimulatorHost } from '../host';

// TODO 没实现
export const BorderContainer = defineComponent({
	name: 'BorderContainer',
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	setup() {
		return () => <div></div>;
	},
});

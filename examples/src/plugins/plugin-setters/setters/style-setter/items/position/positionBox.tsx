import { defineComponent } from 'vue';

export default defineComponent({
	name: 'PositionBox',
	props: {
		style: {
			type: Object,
			default: () => ({}),
		},
	},
	setup() {
		return () => <div>PositionBox</div>;
	},
});

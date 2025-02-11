import { defineComponent } from 'vue';

export const defaultScope = defineComponent({
	setup(props, context) {
		console.log(context);

		return () => <div></div>;
	},
});

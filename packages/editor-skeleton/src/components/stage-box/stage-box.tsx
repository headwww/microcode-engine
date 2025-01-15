import { defineComponent } from 'vue';

export const StageBox = defineComponent({
	name: 'StageBox',
	inheritAttrs: false,
	props: {
		stageName: String,
	},
});

import { defineComponent } from 'vue';

export const Workbench = defineComponent({
	name: 'Workbench',
	props: {
		className: String,
	},
	setup(props) {
		return () => {
			const { className } = props;
			return <div class={['mtc-workbench', className]}></div>;
		};
	},
});

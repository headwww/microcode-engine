import { defineComponent, onMounted } from 'vue';
import { ReactTest3, ReactTest4 } from './test';

const ShowHegus = defineComponent({
	props: {
		value: {
			type: Number,
			required: true,
		},
	},
	setup(props) {
		onMounted(() => {
			console.log('onMounted');
		});
		return () => <div>{props.value}</div>;
	},
});

export const A = defineComponent({
	setup() {
		const a = new ReactTest3();

		return () => {
			const b = new ReactTest4(a);
			return <ShowHegus value={b.hegus.value} />;
		};
	},
});

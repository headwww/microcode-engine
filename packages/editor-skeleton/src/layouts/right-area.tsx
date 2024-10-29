import { defineComponent, PropType } from 'vue';
import { Area } from '../area';

export const RightArea = defineComponent({
	name: 'RightArea',
	props: {
		area: Object as PropType<Area>,
	},
	setup(props) {
		return () => {
			const { area } = props;
			return (
				<div
					class={{
						'mtc-right-area': true,
						'engine-tabpane': true,
						'mtc-area-visible': area?.visible.value,
					}}
				></div>
			);
		};
	},
});

import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { Panel } from '..';

export const RightArea = defineComponent({
	name: 'RightArea',
	props: {
		area: Object as PropType<Area<any, Panel>>,
	},
	setup(props) {
		return () => {
			const { area } = props;
			console.log(
				area?.container.items.slice().sort((a, b) => {
					const index1 = a.config?.index || 0;
					const index2 = b.config?.index || 0;
					return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
				})
			);

			return (
				<div
					class={{
						'mtc-right-area': true,
						'engine-tabpane': true,
						'mtc-area-visible': area?.visible.value,
					}}
				>
					{area?.container.items
						.slice()
						.sort((a, b) => {
							const index1 = a.config?.index || 0;
							const index2 = b.config?.index || 0;
							return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
						})
						.map((item) => item.content)}
				</div>
			);
		};
	},
});

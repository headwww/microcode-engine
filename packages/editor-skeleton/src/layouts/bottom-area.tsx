import { defineComponent, PropType, Fragment } from 'vue';
import { Area } from '../area';
import { Panel } from '..';

export const BottomArea = defineComponent({
	name: 'BottomArea',
	props: {
		area: Object as PropType<Area<any, Panel>>,
	},
	setup(props) {
		return () => {
			const { area } = props;
			if (area?.isEmpty()) {
				return <Fragment></Fragment>;
			}

			return (
				<div
					class={{
						'mtc-bottom-area': true,
						'mtc-area-visible': area?.visible.value,
					}}
				>
					{area?.container.items.map((item) => item.content)}
				</div>
			);
		};
	},
});

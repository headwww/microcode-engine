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
			if (props.area?.isEmpty()) {
				return <Fragment></Fragment>;
			}

			return (
				<div
					class={{
						'mtc-bottom-area': true,
						'mtc-area-visible': props.area?.visible.value,
					}}
				>
					{props.area?.container.items.map((item) => item.content)}
				</div>
			);
		};
	},
});

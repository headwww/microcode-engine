import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { Panel, Widget } from '..';

export const MainArea = defineComponent({
	name: 'MainArea',
	props: {
		area: Object as PropType<Area<any, Panel | Widget>>,
	},
	setup(props) {
		return () => {
			const { area } = props;

			return (
				<div class="mtc-main-area engine-workspacepane">
					{area?.container.items.value.map((item) => item.content)}
				</div>
			);
		};
	},
});

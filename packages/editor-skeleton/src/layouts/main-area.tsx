import { defineComponent, PropType } from 'vue';
import { Area } from '../area';
import { Panel, Widget } from '..';

export const MainArea = defineComponent({
	name: 'MainArea',
	props: {
		area: Object as PropType<Area<any, Panel | Widget>>,
	},
	setup(props) {
		return () => (
			<div class="mtc-main-area engine-workspacepane">
				{props.area?.container.items.map((item) => item.content)}
			</div>
		);
	},
});

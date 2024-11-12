import { defineComponent, PropType } from 'vue';
import { Designer } from '../designer';
import { BuiltinSimulatorHostView } from '../builtin-simulator';

export const ProjectView = defineComponent({
	name: 'ProjectView',
	props: {
		designer: Object as PropType<Designer>,
	},
	setup(props) {
		return () => {
			const { designer } = props;
			designer;
			const Simulator = BuiltinSimulatorHostView;

			return (
				<div class="mtc-project">
					<div class="mtc-simulator-shell">
						<Simulator></Simulator>
					</div>
				</div>
			);
		};
	},
});
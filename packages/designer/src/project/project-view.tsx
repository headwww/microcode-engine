import { defineComponent, onMounted, PropType, ref } from 'vue';
import { Designer } from '../designer';
import { BuiltinSimulatorHostView } from '../builtin-simulator';

export const ProjectView = defineComponent({
	name: 'ProjectView',
	props: {
		designer: Object as PropType<Designer>,
	},
	setup(props) {
		// 用于强制更新的 ref
		const updateFlag = ref(0);

		onMounted(() => {
			const { designer } = props;
			const { project } = designer!;

			project.onRendererReady(() => {
				updateFlag.value++; // 触发重新渲染
			});
		});

		return () => {
			const { designer } = props;
			const { projectSimulatorProps } = designer!;

			// TODO: designer?.simulatorComponent || BuiltinSimulatorHostView
			// TODO LOading
			const Simulator = BuiltinSimulatorHostView;

			return (
				<div class="mtc-project">
					<div class="mtc-simulator-shell">
						<Simulator {...projectSimulatorProps.value}></Simulator>
					</div>
				</div>
			);
		};
	},
});

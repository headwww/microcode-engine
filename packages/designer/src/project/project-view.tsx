import { defineComponent, onMounted, PropType, ref } from 'vue';
import { Designer } from '../designer';
import { BuiltinSimulatorHostView } from '../builtin-simulator';

export const BuiltinLoading = defineComponent({
	name: 'BuiltinLoading',
	setup() {
		return () => (
			<div id="engine-loading-wrapper">
				<div class="lowcode-engine-loading">
					<div class="browser-container">
						{/* 浏览器标题栏 */}
						<div class="browser-header">
							<div class="window-controls">
								<span class="control close"></span>
								<span class="control minimize"></span>
								<span class="control maximize"></span>
							</div>
							<div class="address-bar">
								<div class="url-text">microcode-engine.example.com</div>
							</div>
						</div>

						{/* 原有的加载动画内容 */}
						<div class="browser-content">
							<div class="loading-container">
								<div class="component-panel">
									<div class="component-item"></div>
									<div class="component-item"></div>
									<div class="component-item"></div>
								</div>
								<div class="canvas-area">
									<div class="dragging-component"></div>
									<div class="canvas-outline"></div>
								</div>
								<div class="loading-text">正在初始化引擎...</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	},
});

export const ProjectView = defineComponent({
	name: 'ProjectView',
	props: {
		designer: Object as PropType<Designer>,
	},
	setup(props) {
		const updateFlag = ref(false);

		onMounted(() => {
			const { designer } = props;
			const { project } = designer!;

			project.onRendererReady(() => {
				updateFlag.value = true; // 触发重新渲染
			});
		});

		return () => {
			const { designer } = props;
			const { projectSimulatorProps } = designer!;

			const Simulator =
				(designer?.simulatorComponent as any) || BuiltinSimulatorHostView;

			return (
				<div class="mtc-project">
					<div class="mtc-simulator-shell">
						{!updateFlag.value &&
							!props?.designer?.project?.simulator?.renderer && (
								<BuiltinLoading />
							)}
						<Simulator {...projectSimulatorProps}></Simulator>
					</div>
				</div>
			);
		};
	},
});

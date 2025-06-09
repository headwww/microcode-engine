import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
} from 'vue';
import './index.scss';
import { PaneController, Tree, TreeMaster } from '../model';
import { TreeView } from './tree';

export const LayersPane = defineComponent({
	name: 'LayersPane',
	inheritAttrs: false,
	props: {
		controller: {
			type: Object as PropType<PaneController>,
			required: true,
		},
		treeMaster: {
			type: Object as PropType<TreeMaster>,
			required: true,
		},
	},
	setup(props) {
		const { treeMaster } = props;
		const tree = ref<Tree | null>(treeMaster.currentTree);

		const containerRef = ref<HTMLDivElement>();

		const dispose = [
			props.treeMaster.pluginContext.project.onSimulatorRendererReady(() => {
				tree.value = treeMaster.currentTree;
			}),
			props.treeMaster.pluginContext.project.onChangeDocument(() => {
				tree.value = treeMaster.currentTree;
			}),
			props.treeMaster.pluginContext.project.onRemoveDocument(() => {
				tree.value = treeMaster.currentTree;
			}),
		];

		onBeforeUnmount(() => {
			props.controller.purge();
			dispose.forEach((d) => d());
		});

		onMounted(() => {
			if (containerRef.value) {
				props.controller.mount(containerRef.value);
			}
		});

		return () => (
			<div class="mtc-layers-pane">
				<div ref={containerRef} class={'mtc-layers-container'}>
					<TreeView key={tree.value?.id} tree={tree.value as any} />
				</div>
			</div>
		);
	},
});

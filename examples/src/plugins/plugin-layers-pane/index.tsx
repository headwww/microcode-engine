import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue';
import { LayersPane } from './pane';
import { LayersIcon } from './icons';
import { PaneController, TreeMaster } from './model';

const LayersPaneContext = defineComponent({
	name: 'LayersPaneContext',
	inheritAttrs: false,
	props: {
		treeMaster: {
			type: Object as PropType<TreeMaster>,
			required: false,
		},
		pluginContext: {
			type: Object as PropType<IPublicModelPluginContext>,
		},
		options: {
			type: Object as PropType<any>,
		},
		paneName: {
			type: String as PropType<string>,
			required: true,
		},
	},
	setup(props) {
		const localTreeMaster =
			props.treeMaster || new TreeMaster(props.pluginContext!, props.options);

		const masterPaneController = ref(
			new PaneController(props.paneName, localTreeMaster)
		);

		let unsubscribe: any;

		onMounted(() => {
			unsubscribe = localTreeMaster.onPluginContextChange(() => {
				masterPaneController.value = new PaneController(
					props.paneName,
					localTreeMaster
				);
			});
		});

		onUnmounted(() => {
			unsubscribe?.();
		});

		return () => (
			<LayersPane
				controller={masterPaneController.value}
				key={masterPaneController.value.id}
				treeMaster={localTreeMaster}
			/>
		);
	},
});

const plugin = (ctx: IPublicModelPluginContext, options: any) => ({
	init() {
		const { skeleton } = ctx;

		const treeMaster = new TreeMaster(ctx, options);

		skeleton.add({
			area: 'leftArea',
			name: 'layersPane',
			type: 'PanelDock',
			index: -1,
			props: {
				icon: <LayersIcon />,
				description: '布局',
			},
			panelProps: {
				width: '320px',
				title: '布局',
			},
			content: (
				<LayersPaneContext
					treeMaster={treeMaster}
					paneName="layers-master-pane"
				/>
			),
		});
	},
});

plugin.pluginName = 'LayersPane';

export default plugin;

import {
	IPublicModelDocumentModel,
	IPublicModelPluginContext,
} from '@arvin-shu/microcode-types';
import {
	defineComponent,
	onMounted,
	onUnmounted,
	PropType,
	ref,
	toRaw,
} from 'vue';
import { LayersPane } from './pane';
import { LayersIcon } from './icons';
import { PaneController, TreeMaster } from './model';
import { intlNode } from './locale';

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
				controller={masterPaneController.value as any}
				key={masterPaneController.value.id}
				treeMaster={localTreeMaster}
			/>
		);
	},
});

const plugin = (ctx: IPublicModelPluginContext, options: any) => ({
	init() {
		const { skeleton, canvas, project } = ctx;

		const treeMaster = new TreeMaster(ctx, options);

		skeleton.add({
			area: 'leftArea',
			name: 'layersPane',
			type: 'PanelDock',
			index: -1,
			panelProps: {
				width: '320px',
				title: intlNode('Layers'),
			},
			content: {
				name: 'layers-master-pane',
				props: {
					icon: <LayersIcon />,
					description: intlNode('Layers'),
				},
				content: (
					<LayersPaneContext
						treeMaster={treeMaster}
						paneName="layers-master-pane"
					/>
				),
			},
		});

		skeleton.add({
			area: 'rightArea',
			name: 'layers-backup-pane',
			type: 'Panel',
			props: {
				hiddenWhenInit: true,
			},
			content: (
				<LayersPaneContext
					treeMaster={treeMaster}
					paneName="layers-backup-pane"
				/>
			),
			contentProps: {
				paneName: 'layers-backup-pane',
				treeMaster,
			},
			index: 1,
		});

		const showingPanes = {
			masterPane: false,
			backupPane: false,
		};
		const switchPanes = () => {
			const isDragging = canvas.dragon?.dragging;
			const hasVisibleTreeBoard =
				showingPanes.backupPane || showingPanes.masterPane;
			const shouldShowBackupPane = isDragging && !hasVisibleTreeBoard;

			if (shouldShowBackupPane) {
				skeleton.showPanel('layers-backup-pane');
			} else {
				skeleton.hidePanel('layers-backup-pane');
			}
		};

		canvas.dragon?.onDragstart(() => {
			switchPanes();
		});
		canvas.dragon?.onDragend(() => {
			switchPanes();
		});

		skeleton.onShowPanel((key?: string) => {
			if (key === 'layers-master-pane') {
				showingPanes.masterPane = true;
			}
			if (key === 'layers-backup-pane') {
				showingPanes.backupPane = true;
			}
		});
		skeleton.onHidePanel((key?: string) => {
			if (key === 'layers-master-pane') {
				showingPanes.masterPane = false;
				switchPanes();
			}
			if (key === 'layers-backup-pane') {
				showingPanes.backupPane = false;
			}
		});

		project.onChangeDocument((document: IPublicModelDocumentModel) => {
			if (!document) {
				return;
			}
			const { selection } = document;
			selection?.onSelectionChange(() => {
				const selectedNodes = selection?.getNodes();
				if (!selectedNodes || selectedNodes.length === 0) {
					return;
				}
				const tree = toRaw(treeMaster.currentTree);
				selectedNodes.forEach((node) => {
					const treeNode = toRaw(tree?.getTreeNodeById(node.id));
					tree?.expandAllAncestors(treeNode);
				});
			});
		});
	},
});

plugin.pluginName = 'LayersPane';

export default plugin;

import { CodeOutlined } from '@ant-design/icons-vue';
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { VueCodeEditorPane } from './pane';
import '@arvin-shu/microcode-plugin-base-monaco-editor/theme/index.css';

const InitVueCodeEditor = ({
	project,
	skeleton,
	event,
	material,
}: IPublicModelPluginContext) => ({
	init() {
		const codePane = skeleton.add({
			area: 'leftArea',
			name: 'codeEditor',
			type: 'PanelDock',
			props: {
				icon: <CodeOutlined />,
				description: '源码面板',
			},
			panelProps: {
				width: '600px',
				title: '源码面板',
			},
			content: (
				<VueCodeEditorPane
					material={material}
					project={project}
					skeleton={skeleton}
					event={event}
				/>
			),
		});

		codePane && codePane.disable?.();
		project.onSimulatorRendererReady(() => {
			codePane?.enable?.();
		});
	},
});

InitVueCodeEditor.pluginName = 'vueCodeEditor';

export default InitVueCodeEditor;

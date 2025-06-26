import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { VueCodeEditorPane } from './pane';
import '@arvin-shu/microcode-plugin-base-monaco-editor/theme/index.css';
import { CodeIcon } from './icons/code';
import { intlNode } from './locale';

const InitVueCodeEditor = (
	{ project, skeleton, event, material }: IPublicModelPluginContext,
	options: any
) => ({
	init() {
		const codePane = skeleton.add({
			area: 'leftArea',
			name: 'codeEditor',
			type: 'PanelDock',
			props: {
				icon: <CodeIcon />,
				description: intlNode('FunctionPanel'),
			},
			panelProps: {
				width: '800px',
				title: intlNode('FunctionPanel'),
			},
			content: (
				<VueCodeEditorPane
					material={material}
					project={project}
					skeleton={skeleton}
					requireConfig={options.requireConfig}
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

InitVueCodeEditor.meta = {
	preferenceDeclaration: {
		title: '源码面板配置',
		properties: [
			{
				key: 'requireConfig',
				type: 'object',
				description: '编辑器配置',
			},
		],
	},
};

InitVueCodeEditor.pluginName = 'vueCodeEditor';

export default InitVueCodeEditor;

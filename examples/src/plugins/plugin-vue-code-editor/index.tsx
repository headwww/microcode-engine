import { CodeOutlined } from '@ant-design/icons-vue';
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';

const InitVueCodeEditor = ({
	project,
	skeleton,
	event,
	material,
}: IPublicModelPluginContext) => ({
	init() {
		skeleton.add({
			area: 'leftArea',
			name: 'codeEditor',
			type: 'PanelDock',
			props: {
				icon: <CodeOutlined />,
				description: '源码面板',
			},
			panelProps: {
				width: '500px',
				title: '源码面板',
			},
			content: (
				<div
					material={material}
					project={project}
					skeleton={skeleton}
					event={event}
				/>
			),
		});
	},
});

InitVueCodeEditor.pluginName = 'vueCodeEditor';

export default InitVueCodeEditor;

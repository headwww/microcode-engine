import { Designer, DesignerView } from '@arvin-shu/microcode-designer';
import { Editor, engineConfig } from '@arvin-shu/microcode-editor-core';
import { defineComponent, PropType, reactive } from 'vue';

/**
 * 设计器的入口
 */
export const DesignerPlugin = defineComponent({
	name: 'DesignerPlugin',
	props: {
		engineEditor: Object as PropType<Editor>,
	},
	setup(props) {
		const { engineEditor: editor } = props;

		const simulatorProps = reactive({
			componentMetadatas: [],
			library: null,
			extraEnvironment: null,
			renderEnv: 'default', // 渲染环境 rax vue 这些
			device: 'default', // 设备类型  pc phone
			locale: '',
			designMode: 'live',
			deviceClassName: '',
			simulatorUrl: null,
			requestHandlersMap: null,
			utilsMetadata: [],
		});

		/**
		 * 获取模拟器需要的资源
		 */
		async function setupAssets() {
			const assets = await editor?.onceGot('assets');
			const renderEnv =
				engineConfig.get('renderEnv') || editor?.get('renderEnv');
			const device = engineConfig.get('device') || editor?.get('device');
			const locale = engineConfig.get('locale') || editor?.get('locale');
			const designMode =
				engineConfig.get('designMode') || editor?.get('designMode');
			const deviceClassName =
				engineConfig.get('deviceClassName') || editor?.get('deviceClassName');
			const simulatorUrl =
				engineConfig.get('simulatorUrl') || editor?.get('simulatorUrl');
			const requestHandlersMap =
				engineConfig.get('requestHandlersMap') ||
				editor?.get('requestHandlersMap');

			const { packages, components, extraEnvironment, utils } = assets;

			// 获取资源库
			simulatorProps.library = packages;
			// 获取模拟器地址
			simulatorProps.simulatorUrl =
				engineConfig.get('simulatorUrl') || editor?.get('simulatorUrl');
			// 获取组件元数据
			simulatorProps.componentMetadatas = [...components] as any;
			// 获取额外环境变量
			simulatorProps.extraEnvironment = extraEnvironment;
			// 获取渲染环境
			simulatorProps.renderEnv = renderEnv;
			// 获取设备类型
			simulatorProps.device = device;
			// 获取语言
			simulatorProps.locale = locale;
			// 获取设计模式
			simulatorProps.designMode = designMode;
			// 获取模拟器地址
			simulatorProps.simulatorUrl = simulatorUrl;
			// 获取请求处理映射
			simulatorProps.requestHandlersMap = requestHandlersMap;
			// 获取工具函数
			simulatorProps.utilsMetadata = utils;
			// 获取模拟的设备样式类名
			simulatorProps.deviceClassName = deviceClassName;
			engineConfig.onGot('locale', (locale) => {
				simulatorProps.locale = locale;
			});
			engineConfig.onGot('device', (device) => {
				simulatorProps.device = device;
			});
			engineConfig.onGot('requestHandlersMap', (requestHandlersMap) => {
				simulatorProps.requestHandlersMap = requestHandlersMap;
			});
		}

		setupAssets();

		function handleDesignerMount(designer: Designer) {
			const editor = props.engineEditor;
			editor?.set('designer', designer);
			editor?.eventBus.emit('designer.ready', designer);
			editor?.onGot('schema', (schema) => {
				designer.project.open(schema);
			});
		}

		return () => {
			if (!simulatorProps.library || !simulatorProps.componentMetadatas) {
				return null;
			}

			return (
				<DesignerView
					onMount={handleDesignerMount}
					className="microcode-plugin-designer"
					editor={editor}
					name={editor?.viewName}
					designer={editor?.get('designer')}
					componentMetadatas={simulatorProps.componentMetadatas}
					simulatorProps={{
						...simulatorProps,
					}}
				></DesignerView>
			);
		};
	},
});

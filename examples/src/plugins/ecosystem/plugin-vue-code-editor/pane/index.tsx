import { defineComponent, PropType, ref, watchEffect } from 'vue';
import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';
import {
	IPublicApiEvent,
	IPublicApiMaterial,
	IPublicApiProject,
	IPublicApiSkeleton,
	IPublicEnumTransformStage,
} from '@arvin-shu/microcode-types';
import { TabPane, Tabs, Button } from 'ant-design-vue';
import './index.scss';
import { debounce, isString } from 'lodash-es';
import { defaultCode } from '../config';
import { parsePropsToCode, parseSchemaToCode } from './parse';
import { JsEditor } from '../components';
import { intlNode } from '../locale';

export const VueCodeEditorPane = defineComponent({
	name: 'VueCodeEditorPane',
	inheritAttrs: false,
	props: {
		material: {
			type: Object as PropType<IPublicApiMaterial>,
		},
		project: {
			type: Object as PropType<IPublicApiProject>,
		},
		event: {
			type: Object as PropType<IPublicApiEvent>,
		},
		skeleton: {
			type: Object as PropType<IPublicApiSkeleton>,
		},
		requireConfig: {
			type: Object as PropType<any>,
		},
	},

	setup(props) {
		const { project } = props;
		const schema = ref<any>(
			project?.currentDocument
				? (project.currentDocument.exportSchema(
						IPublicEnumTransformStage.Render
					) ?? null)
				: null
		);

		const jsEditor = ref();

		const cssCode = ref(schema.value?.css);

		const jsCode = ref('');

		watchEffect(() => {
			if (!schema.value) return '';
			const originCode = (schema.value as any).originCode;
			if (isString(originCode)) {
				jsCode.value = originCode;
				return;
			}
			jsCode.value = defaultCode
				.replace(
					/\s*props: {(\s*\/\*@{props:(\d+)}\*\/)\s*},/,
					(matched, placeholder, indent) => {
						const code = (schema.value as any)?.props
							? `\n${parsePropsToCode(schema.value.props, Number(indent))}`
							: '';
						return code.trim() ? matched.replace(placeholder, code) : '';
					}
				)
				.replace(
					/\s*data: \(\) => \({(\s*\/\*@{data:(\d+)}\*\/)\s*}\),/,
					(matched, placeholder, indent) => {
						const code = schema.value?.state
							? `\n${parseSchemaToCode(schema.value.state, Number(indent))}`
							: 'hello: "你好"';
						return code.trim() ? matched.replace(placeholder, code) : '';
					}
				)
				.replace(
					/\s*methods: {(\s*\/\*@{methods:(\d+)}\*\/)\s*},/,
					(matched, placeholder, indent) => {
						const code = schema.value?.methods
							? `\n${parseSchemaToCode(schema.value.methods, Number(indent))}`
							: '';

						return code.trim() ? matched.replace(placeholder, code) : '';
					}
				)
				.replace(/\s*\/\*@{lifeCycles:(\d+)}\*\//, (_, indent) => {
					const code = schema.value?.lifeCycles
						? `\n${parseSchemaToCode(schema.value.lifeCycles, Number(indent))}`
						: '';
					return code.trim() ? code : '';
				})
				.trimStart();
		});

		const currentTab = ref('js');

		props.event?.on('common:codeEditor.focusByFunction', (params) => {
			currentTab.value = 'js';
			setTimeout(() => {
				jsEditor.value?.focusByFunctionName(params);
			}, 100);
		});

		props.event?.on('common:codeEditor.addFunction', (params) => {
			currentTab.value = 'js';
			setTimeout(() => {
				jsEditor.value?.addFunction(params);
			}, 100);
		});

		function renderTabBar(props: any) {
			const { DefaultTabBar } = props;
			return (
				<div>
					<DefaultTabBar {...props} />
					<Button
						onClick={onSave}
						type="primary"
						class="mtc-code-pane-save-btn"
					>
						{intlNode('Save')}
					</Button>
				</div>
			);
		}

		const onSave = debounce(() => {
			const currentSchema = project?.currentDocument
				? project.currentDocument.exportSchema(IPublicEnumTransformStage.Render)
				: schema.value;
			if (!currentSchema) {
				throw new Error('schema is empty');
			}
			const newSchema =
				jsEditor.value?.transformSchema(currentSchema) ?? currentSchema;

			newSchema.css = cssCode.value;
			newSchema.originCode = jsCode.value;
			if (project?.currentDocument) {
				project.currentDocument.importSchema(newSchema);
			}
			project?.simulatorHost?.renderer?.rerender();
		}, 250);

		return () => (
			<Tabs
				size="small"
				prefixCls="mtc-code-pane-tabs"
				type="card"
				v-model:activeKey={currentTab.value}
				renderTabBar={renderTabBar}
			>
				<TabPane key="js" tab="index.js">
					<JsEditor
						ref={jsEditor}
						code={jsCode.value}
						requireConfig={props.requireConfig}
						material={props.material!}
						onChange={(value) => {
							jsCode.value = value;
						}}
						onAddFunction={(value) => {
							jsCode.value = value;
							onSave();
						}}
					></JsEditor>
				</TabPane>
				<TabPane key="css" tab="index.css">
					<MonacoEditor
						value={cssCode.value}
						language="css"
						height="100%"
						style={{ height: '100%' }}
						supportFullScreen
						requireConfig={props.requireConfig}
						onChange={(value) => {
							cssCode.value = value;
						}}
					></MonacoEditor>
				</TabPane>
			</Tabs>
		);
	},
});

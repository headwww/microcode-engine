import { event, project } from '@arvin-shu/microcode-engine';
import { Button, Modal } from 'ant-design-vue';
import {
	computed,
	defineComponent,
	onMounted,
	PropType,
	ref,
	toRaw,
} from 'vue';
import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';

import './index.scss';

interface TreeNode {
	title: string;
	key: string;
	children?: TreeNode[];
}

export const VariableBindModal = defineComponent({
	name: 'VariableBindModal',
	inheritAttrs: false,
	props: {
		config: Object as PropType<Record<string, any>>,
	},
	setup(props) {
		const visible = ref(false);

		const jsCode = ref('');

		const exportSchema = computed(
			() => props.config?.props?.getSchema?.() || project.exportSchema()
		);

		const variableList = ref<TreeNode[]>([]);

		const field = ref<any>();

		const monocoEditor = ref<any>();

		const editorDidMount = (editor: any) => {
			monocoEditor.value = editor;
		};

		onMounted(() => {
			event.on(
				'common:variableBindModal.openModal',
				({ field: fieldValue }) => {
					field.value = fieldValue;
					initCode();
					openModal();
				}
			);
		});

		function initCode() {
			const fieldValue = field.value.getValue();
			jsCode.value = fieldValue?.value;
		}

		function openModal() {
			visible.value = true;

			const stateVaroableList = getVarableList();

			const methods = getMethods();

			const dataSource = getDataSource();

			const buildTreeData = [
				{
					title: '响应式属性',
					key: 'stateVaroableList',
					children: stateVaroableList,
				},
				{
					title: '自定义处理函数',
					key: 'methods',
					children: methods,
				},
				{
					title: '数据源',
					key: 'dataSource',
					children: dataSource,
				},
			];
			variableList.value = [...buildTreeData];
		}

		function getVarableList() {
			const schema = exportSchema.value;
			const stateMap = schema.componentsTree[0]?.state;
			const dataSource = [];
			for (const key in stateMap) {
				if (Object.prototype.hasOwnProperty.call(stateMap, key) && key) {
					dataSource.push({
						key: `this.$data.${key}`,
						title: key,
					});
				}
			}
			return dataSource;
		}

		function getMethods() {
			const schema = exportSchema.value;

			const methodsMap = schema.componentsTree[0]?.methods;
			const methods = [];

			for (const key in methodsMap) {
				if (Object.prototype.hasOwnProperty.call(methodsMap, key) && key) {
					methods.push({
						key: `this.${key}()`,
						title: key,
					});
				}
			}

			return methods;
		}

		/**
		 * 获取数据源面板中的数据
		 * @param  {String}
		 * @return {Array}
		 */
		function getDataSource() {
			const schema = exportSchema.value;
			const stateMap = schema.componentsTree[0]?.dataSource;
			const list = stateMap?.list || [];
			const dataSource = [];

			for (const item of list) {
				if (item && item.id) {
					dataSource.push({
						title: item.id,
						key: `this.dataSourceMap.${item.id}`,
					});
				}
			}

			return dataSource;
		}

		function handleClickTreeNode(node: TreeNode) {
			const { lineNumber, column } = monocoEditor.value.getPosition();
			toRaw(monocoEditor.value).executeEdits('insert-code', [
				{
					range: {
						startLineNumber: lineNumber,
						startColumn: column,
						endLineNumber: lineNumber,
						endColumn: column,
					},
					text: node.key,
				},
			]);
		}

		const renderTreeNode = (node: TreeNode) => (
			<div class="variable-tree-node" key={node.key}>
				<div
					class="variable-node-title"
					onClick={() => {
						if (node.children === undefined || node.children.length === 0) {
							handleClickTreeNode(node);
						}
					}}
				>
					{node.title}
				</div>
				{node.children && node.children.length > 0 && (
					<div class="variable-node-children">
						{node.children.map((child) => renderTreeNode(child))}
					</div>
				)}
			</div>
		);

		function handleBind() {
			const fieldValue = field.value?.getValue();
			field.value?.setValue({
				type: 'JSExpression',
				value: jsCode.value,
				mock:
					Object.prototype.toString.call(fieldValue) === '[object Object]'
						? fieldValue.mock
						: fieldValue,
			});
			visible.value = false;
		}

		const removeTheBinding = () => {
			visible.value = false;
			const fieldValue = field.value.getValue();
			const value =
				Object.prototype.toString.call(fieldValue) === '[object Object]'
					? fieldValue.mock
					: fieldValue;
			field.value.setValue(value);
		};

		function renderFooter() {
			return (
				<div style="display: flex; justify-content: space-between;">
					<Button danger onClick={removeTheBinding}>
						移除绑定
					</Button>
					<div>
						<Button
							onClick={handleBind}
							type="primary"
							disabled={!jsCode.value}
						>
							绑定
						</Button>
						<Button
							onClick={() => {
								visible.value = false;
							}}
						>
							取消
						</Button>
					</div>
				</div>
			);
		}
		return () => (
			<div>
				<Modal
					maskClosable={false}
					width="80vm"
					centered
					title="变量绑定"
					destroyOnClose
					footer={renderFooter()}
					v-model:open={visible.value}
				>
					<div class="variable-modal-wrapper">
						<div class="variable-modal-body">
							<div class="variable-left-container">
								<div class="variable-modal-title">变量列表</div>
								<div class="variable-selector-inner">
									{variableList.value.map((node) => renderTreeNode(node))}
								</div>
							</div>
							<div class="variable-right-container">
								<div className="variable-modal-title">绑定</div>
								<MonacoEditor
									language="javascript"
									value={jsCode.value}
									style="height: calc(100% - 178px);border:1px solid var(--color-field-border,rgba(31,56,88,.3))!important"
									editorDidMount={(_, editor) => {
										editorDidMount.call(this, editor);
									}}
									onChange={(value) => {
										jsCode.value = value;
									}}
								></MonacoEditor>
							</div>
						</div>
					</div>
				</Modal>
			</div>
		);
	},
});

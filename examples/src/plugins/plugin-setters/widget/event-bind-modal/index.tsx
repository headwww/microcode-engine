import { event, project, skeleton } from '@arvin-shu/microcode-engine';
import { Modal, Input, Form } from 'ant-design-vue';
import { PluginConfig } from '@arvin-shu/microcode-types';
import { defineComponent, onMounted, PropType, ref } from 'vue';
import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';
import './index.scss';
import { uniqueId } from '@arvin-shu/microcode-utils';

const propEventsReg = /(this\.)?props\.[a-zA-Z0-9\-_]+/;

const tempPlaceHolderReg = /\$\{extParams\}/g;

// eslint-disable-next-line no-template-curly-in-string
const tempPlaceHolder = '${extParams}';

export const EventBindModal = defineComponent({
	name: 'EventBindModal',
	props: {
		config: {
			type: Object as PropType<PluginConfig>,
		},
	},
	setup(props) {
		const open = ref(false);

		const eventList = ref<{ name: string }[]>([]);

		const categoryList = ref([{ name: '内置动作' }, { name: '自定义函数' }]);

		const selectedEventName = ref('新建函数');

		const selectedCategoryName = ref('自定义函数');

		const relatedEventName = ref('');

		const bindEventName = ref('');

		const paramStr = ref('{}');

		const setterName = ref('event-setter');

		const configEventData = ref<any>();

		onMounted(() => {
			event.on(
				`common:${props.config?.pluginKey}.openModal`,
				(
					mRelatedEventName: string,
					mSetterName: string,
					mParamStr: string,
					isEdit: boolean,
					mBindEventName: string,
					mConfigEventData: object
				) => {
					setterName.value = mSetterName;
					if (!mParamStr) {
						paramStr.value = '{}';
					} else {
						paramStr.value = mParamStr;
					}
					selectedEventName.value = mRelatedEventName;

					if (!isEdit) {
						selectedCategoryName.value = '自定义函数';
						selectedEventName.value = '新建函数';
					}

					configEventData.value = mConfigEventData;
					relatedEventName.value = mRelatedEventName;
					bindEventName.value = mBindEventName;
					inputValue.value = `${relatedEventName.value}_${uniqueId()}`;
					open.value = true;

					const schema = project.exportSchema();
					const pageNode = schema.componentsTree[0];
					if (pageNode.methods) {
						eventList.value = [];
						for (const key in pageNode.methods) {
							eventList.value.push({
								name: key,
							});
						}
					}
				}
			);
		});

		const inputValue = ref('');

		const onSelectItem = (name: string) => {
			selectedEventName.value = name;
		};

		const formatEventName = (eventName: string) =>
			eventName.replace(/(this\.)|(\s+)/, '');

		const onOk = () => {
			let eventName = '';
			if (selectedEventName.value === '新建函数') {
				eventName = formatEventName(inputValue.value);
			} else {
				eventName = formatEventName(selectedEventName.value);
			}
			const useParams = paramStr.value ? paramStr.value : '{}';

			event.emit(
				`${setterName.value}.bindEvent`,
				eventName,
				useParams,
				bindEventName.value
			);

			// 选中的是新建函数 && 注册了sourceEditor面板
			if (
				selectedEventName.value === '新建函数' &&
				!propEventsReg.test(eventName)
			) {
				// 判断面板是否处于激活状态
				skeleton.showPanel('codeEditor');
				const formatTemp = formatTemplate(
					configEventData.value?.template,
					eventName,
					!!useParams
				);
				setTimeout(() => {
					event.emit('codeEditor.addFunction', {
						functionName: eventName,
						template: formatTemp,
					});
				}, 200);
			}

			open.value = false;
		};

		const pickupFunctionName = (codeStr: string) =>
			codeStr.substr(0, codeStr.indexOf('('));

		const removeSpace = (str: string) => str.replace(/\s*/g, '');

		const formatTemplate = (
			template: string,
			eventName: string,
			useParams: boolean
		) => {
			let formatTemp;
			if (template) {
				const functionName = pickupFunctionName(template);

				formatTemp = template.replace(
					new RegExp(`^s*${functionName}`),
					eventName
				);
				if (useParams) {
					formatTemp = formatTemp.replace(tempPlaceHolderReg, 'extParams');
				} else {
					const leftIndex = formatTemp.indexOf('(');
					const rightIndex = formatTemp.indexOf(')');
					// 提取括号中的参数列表
					const paramList = formatTemp
						.substr(leftIndex + 1, rightIndex - (leftIndex + 1))
						.split(',');

					paramList.map((item, index) => {
						if (removeSpace(item) === tempPlaceHolder) {
							paramList.splice(index, 1);
						}
						return item;
					});

					// 重新join进去

					formatTemp = `${formatTemp.substr(0, leftIndex)}(${paramList.join(',')})${formatTemp.substr(
						rightIndex + 1,
						formatTemp.length
					)}`;
				}
			}

			return formatTemp;
		};

		return () => (
			<Modal
				title="事件绑定"
				width={900}
				centered
				destroyOnClose
				cancelText="取消"
				okText="确定"
				onOk={onOk}
				v-model:open={open.value}
			>
				<div class="mtc-event-bind-modal">
					<div class="mtc-action-selector">
						<div class="mtc-action-title">事件列表</div>
						<div class="mtc-action-selector-inner">
							<div class="mtc-action-selector-category">
								{categoryList.value.map((item) => (
									<div
										key={item.name}
										onClick={() => {
											selectedCategoryName.value = item.name;
										}}
										class={`mtc-action-selector-category-item ${selectedCategoryName.value === item.name ? 'active' : ''}`}
									>
										{item.name}
									</div>
								))}
							</div>
							<div class="mtc-action-selector-container">
								<div class="mtc-actions-items">
									<div
										onClick={() => {
											onSelectItem('新建函数');
										}}
										class={`mtc-action-item ${selectedEventName.value === '新建函数' ? 'active' : ''}`}
									>
										新建函数
									</div>
									{eventList.value.map((item) => (
										<div
											onClick={() => {
												onSelectItem(item.name);
											}}
											class={`mtc-action-item ${selectedEventName.value === item.name ? 'active' : ''}`}
										>
											{item.name}
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
					<div class="mtc-action-config">
						{selectedEventName.value === '新建函数' ? (
							<div class="mtc-action-new-function">
								<div class="mtc-action-title">函数名称</div>
								<Form>
									<Form.Item>
										<Input v-model:value={inputValue.value} />
									</Form.Item>
								</Form>
							</div>
						) : null}

						<div class="mtc-action-params-editor">
							<div class="mtc-action-title">参数设置</div>
							<div
								style={{
									width: '570px',
									height: `${selectedEventName.value === '新建函数' ? '257px' : '344px'}`,
									border: '1px solid rgba(31, 56, 88, 0.3)',
									borderRadius: '4px',
								}}
							>
								<MonacoEditor
									value={paramStr.value}
									{...defaultEditorOption}
									language="json"
									height={`${selectedEventName.value === '新建函数' ? '250px' : '337px'}`}
									onChange={(newCode: string) => {
										paramStr.value = newCode;
									}}
								></MonacoEditor>
							</div>
						</div>
					</div>
				</div>
			</Modal>
		);
	},
});

const defaultEditorOption = {
	height: '319px',
	width: '100%',
	readOnly: false,
	automaticLayout: true,
	folding: true, // 默认开启折叠代码功能
	lineNumbers: 'on',
	wordWrap: 'off',
	formatOnPaste: true,
	fontSize: 12,
	tabSize: 2,
	scrollBeyondLastLine: false,
	fixedOverflowWidgets: false,
	snippetSuggestions: 'top',
	minimap: {
		enabled: false,
	},
	scrollbar: {
		vertical: 'auto',
		horizontal: 'auto',
	},
};

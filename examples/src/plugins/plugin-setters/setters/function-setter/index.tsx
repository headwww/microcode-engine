import {
	defineComponent,
	onBeforeUnmount,
	onMounted,
	PropType,
	ref,
} from 'vue';
import { Button, Modal } from 'ant-design-vue';
import { event, skeleton } from '@arvin-shu/microcode-engine';
import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';
// @ts-ignore
import { js_beautify } from 'js-beautify';
import { EditIcon } from './icons/edit';
import { DeleteIcon } from './icons/delete';
import './index.scss';

const SETTER_NAME = 'function-setter';

export const FunctionSetter = defineComponent({
	name: 'FunctionSetter',
	emits: ['change'],
	inheritAttrs: false,
	props: {
		value: {
			type: [Object, String] as PropType<any>,
		},
		field: Object as PropType<any>,
		template: null,
		removeProp: {
			type: Function as PropType<() => void>,
		},
	},
	setup(props, { emit }) {
		const emitEventName = ref('');

		const open = ref(false);

		const functionCode = ref('');

		onMounted(() => {
			emitEventName.value = `${SETTER_NAME}-${props.field.id}`;
			event.on(`common:${emitEventName.value}.bindEvent`, bindEvent);
		});

		onBeforeUnmount(() => {
			event.off(`common:${emitEventName.value}.bindEvent`, bindEvent);
		});

		const bindEvent = (eventName: any, paramStr: any) => {
			bindEventCallback(eventName, paramStr);
		};

		const bindEventCallback = (eventName: string, paramStr: string) => {
			emit('change', {
				type: 'JSFunction',
				value: `function(){ return this.${eventName}.apply(this,Array.prototype.slice.call(arguments).concat([${
					paramStr || ''
				}])) }`,
			});
		};

		const bindFunction = (isEdit?: boolean) => {
			const { field, value, template } = props;

			let paramStr;
			let functionName;

			if (value) {
				paramStr = parseFunctionParam(value.value);
				functionName = parseFunctionName(value.value);
			}

			event.emit(
				'eventBindModal.openModal',
				functionName || field.name,
				emitEventName.value,
				paramStr,
				isEdit,
				functionName || field.name,
				{ template }
			);
		};

		const parseFunctionName = (functionString: string) =>
			// 因为函数格式是固定的，所以可以按照字符换去匹配获取函数名
			functionString.split('this.')[1]?.split('.')[0];

		const parseFunctionParam = (functionString: string) => {
			const matchList = functionString.match(/\[([\s\S]*?)\]/g);
			if (matchList?.length) {
				const paramStr = matchList[0].substring(1, matchList[0].length - 1);
				if (paramStr === '') {
					return null;
				}
				return paramStr;
			}
		};

		const removeFunctionBind = () => {
			const { removeProp } = props;
			removeProp?.();
		};

		const onRelatedEventNameClick = (relatedEventName: string) => {
			// props 事件，不需要跳转
			if (/(this\.)?props\./.test(relatedEventName)) {
				return;
			}
			skeleton.showPanel('codeEditor');
			setTimeout(() => {
				event.emit('codeEditor.focusByFunction', {
					functionName: relatedEventName,
				});
			});
		};

		const openDialog = () => {
			open.value = true;
			functionCode.value = props.value?.value;
		};

		const onDialogOk = () => {
			emit('change', {
				type: 'JSFunction',
				value: functionCode.value ? functionCode.value : 'function() { }',
			});
			open.value = false;
		};

		const renderBindFunction = () => {
			const { value } = props;
			const functionName = parseFunctionName(value.value);

			return (
				<div class="mtc-block-setter-event-list-item">
					<div class="item-header">
						<span class="event-name">{props.field?.name}</span>
						<div class="action-buttons">
							<EditIcon onClick={() => bindFunction(true)} class="anticon" />
							<DeleteIcon
								onClick={() => removeFunctionBind()}
								class="anticon"
							/>
						</div>
					</div>
					<div class="event-function">
						<span class="function-name">function</span>
						<span
							class="params"
							onClick={() => onRelatedEventNameClick(functionName)}
						>
							{functionName}
						</span>
						<span class="parentheses">()</span>
					</div>
				</div>
			);
		};

		const renderEditFunctionButton = () => (
			<div>
				<Button
					style={{ width: '100%' }}
					icon={
						<EditIcon
							style={{ verticalAlign: 'middle', height: '18px', width: '18px' }}
						></EditIcon>
					}
					onClick={() => openDialog()}
					type="primary"
				>
					编辑函数
				</Button>
			</div>
		);

		const renderButton = () => (
			<Button
				style={{ width: '100%' }}
				onClick={() => {
					bindFunction();
				}}
			>
				绑定函数
			</Button>
		);

		const updateCode = (newCode: string) => {
			functionCode.value = newCode;
		};

		return () => {
			const { value } = props;
			let functionName = '';
			if (value && value.value) {
				functionName = parseFunctionName(value.value);
			}

			let renderFunction;
			if (value) {
				if (functionName) {
					renderFunction = renderBindFunction;
				} else {
					renderFunction = renderEditFunctionButton;
				}
			} else {
				renderFunction = renderButton;
			}

			return (
				<div class="mtc-function-setter">
					{renderFunction()}
					{value && value.value && (
						<Modal
							title="编辑函数"
							onOk={onDialogOk}
							destroyOnClose
							v-model:open={open.value}
							okText="确定"
							cancelText="取消"
						>
							<div style={{ width: '100%', height: '400px' }}>
								<MonacoEditor
									value={js_beautify(value.value)}
									{...defaultEditorOption}
									height="400px"
									language="javascript"
									onChange={(value) => {
										updateCode(value);
									}}
								></MonacoEditor>
							</div>
						</Modal>
					)}
				</div>
			);
		};
	},
});

const defaultEditorOption = {
	width: '100%',
	height: '95%',
	options: {
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
	},
};

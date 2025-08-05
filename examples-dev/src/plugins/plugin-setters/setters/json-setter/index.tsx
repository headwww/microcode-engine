import { computed, defineComponent, ref, PropType } from 'vue';
import { Button, Modal } from 'ant-design-vue';
import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';
// @ts-ignore
import { js_beautify } from 'js-beautify';
import { intl } from './locale';

// TODO MonacoEditor地址设置
const defaultEditorOption = {
	width: '100%',
	height: '400px',
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
	throttle: 0,
	scrollbar: {
		vertical: 'auto',
		horizontal: 'auto',
	},
};

export const JsonSetter = defineComponent({
	name: 'JsonSetter',
	props: {
		value: null,
		removeProp: {
			type: Function as PropType<() => void>,
		},
	},
	emits: ['change'],
	setup(props, { emit }) {
		const datasourceCode = ref('');

		const value = computed({
			get() {
				return JSON.stringify(props.value);
			},
			set(val: string) {
				emit('change', val);
			},
		});

		const handleOk = () => {
			if (datasourceCode.value && datasourceCode.value !== '') {
				try {
					value.value = JSON.parse(datasourceCode.value);
					open.value = false;
				} catch (e) {
					Modal.error({
						title: intl('FailedToSaveData'),
						content: (e as Error).message,
					});
				}
			} else {
				props.removeProp?.();
				open.value = false;
			}
		};

		const openModal = () => {
			datasourceCode.value = value.value;
			open.value = true;
		};

		const renderButton = (value: string) =>
			!value ? (
				<Button style={{ width: '100%' }} onClick={openModal}>
					{intl('BindingData')}
				</Button>
			) : (
				<Button
					style={{ width: '100%' }}
					type="primary"
					onClick={openModal}
					icon={<EditIcon />}
				>
					{intl('EditData')}
				</Button>
			);

		const updateCode = (newCode: string) => {
			datasourceCode.value = newCode;
		};

		const open = ref(false);

		return () => (
			<div>
				{renderButton(value.value)}
				<Modal
					destroyOnClose
					v-model:open={open.value}
					onOk={handleOk}
					title={intl('EditData')}
					cancelText={intl('Cancel')}
					width={'600px'}
					okText={intl('Confirm')}
				>
					<div style={{ width: '100%', height: '400px' }}>
						<MonacoEditor
							value={js_beautify(value.value)}
							{...defaultEditorOption}
							language="json"
							height="400px"
							onChange={updateCode}
						></MonacoEditor>
					</div>
				</Modal>
			</div>
		);
	},
});

export const EditIcon = defineComponent({
	name: 'EditIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				style={{
					verticalAlign: 'middle',
					marginRight: '4px',
				}}
			>
				<path
					fill="currentColor"
					d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h6.525q.5 0 .75.313t.25.687t-.262.688T11.5 5H5v14h14v-6.525q0-.5.313-.75t.687-.25t.688.25t.312.75V19q0 .825-.587 1.413T19 21zm4-7v-2.425q0-.4.15-.763t.425-.637l8.6-8.6q.3-.3.675-.45t.75-.15q.4 0 .763.15t.662.45L22.425 3q.275.3.425.663T23 4.4t-.137.738t-.438.662l-8.6 8.6q-.275.275-.637.438t-.763.162H10q-.425 0-.712-.288T9 14m12.025-9.6l-1.4-1.4zM11 13h1.4l5.8-5.8l-.7-.7l-.725-.7L11 11.575zm6.5-6.5l-.725-.7zl.7.7z"
				/>
			</svg>
		);
	},
});

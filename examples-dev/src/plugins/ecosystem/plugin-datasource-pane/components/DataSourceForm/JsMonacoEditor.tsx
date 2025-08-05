import { defineComponent, computed, PropType } from 'vue';
import MonacoEditor from '@arvin-shu/microcode-plugin-base-monaco-editor';

export const JsMonacoEditor = defineComponent({
	name: 'JsMonacoEditor',
	props: {
		value: {
			type: Object as PropType<any>,
		},
		requireConfig: {
			type: Object as PropType<any>,
		},
	},
	emits: ['update:value'],
	setup(props, { emit }) {
		const value = computed({
			get: () => props.value?.value,
			set: (value) => {
				emit('update:value', transformValue(value));
			},
		});

		function transformValue(value: any) {
			return {
				type: 'JSFunction',
				value,
			};
		}
		return () => (
			<MonacoEditor
				requireConfig={props.requireConfig}
				supportFullScreen
				height={'150px'}
				width={'450px'}
				style={{
					width: '450px',
					border: '1px solid rgb(31 56 88 / 30%) !important',
				}}
				language="javascript"
				value={value.value}
				onChange={(v) => {
					value.value = v;
				}}
			/>
		);
	},
});

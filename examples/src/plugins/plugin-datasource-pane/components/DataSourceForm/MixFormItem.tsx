import { computed, defineComponent, PropType } from 'vue';
import { Title } from '@arvin-shu/microcode-editor-core';
import { isJSExpression } from '@arvin-shu/microcode-utils';
import { event } from '@arvin-shu/microcode-engine';
import { Textarea } from 'ant-design-vue';
import { VariableIcon } from '../../icons/variable';
import { intlNode } from '../../locale';

export const MixFormItem = defineComponent({
	name: 'MixFormItem',
	props: {
		value: null,
		setter: String as PropType<'Textarea' | 'Binded'>,
	},
	emits: ['update:value'],
	setup(props, { emit }) {
		computed({
			get: () => props.value,
			set: (value: any) => {
				emit('update:value', value);
			},
		});

		const isVariableBinded = computed(() => isJSExpression(props.value));

		const mockOrValue = computed(() => {
			if (isJSExpression(props.value)) {
				return props.value.mock;
			}
			return props.value;
		});

		function getValue() {
			return props.value;
		}

		function setValue(value: any) {
			emit('update:value', value);
		}

		function renderSetter() {
			if (props.setter === 'Textarea') {
				return (
					<Textarea
						value={mockOrValue.value}
						onUpdate:value={(value) => {
							if (!isVariableBinded.value) {
								setValue(value);
							} else {
								setValue({
									...props.value,
									mock: value,
								});
							}
						}}
						autoSize={{ minRows: 3, maxRows: 5 }}
					/>
				);
			}

			return (
				<a
					onClick={() => {
						event.emit('variableBindModal.openModal', {
							field: {
								getValue,
								setValue,
							},
							scope: 'state.',
						});
					}}
					style={{
						maxWidth: '350px',
						overflow: 'hidden',
						textOverflow: 'ellipsis',
						whiteSpace: 'nowrap',
						display: 'inline-block',
					}}
				>
					{intlNode('Binded: {expr}', {
						expr: props.value?.value ?? '-',
					})}
				</a>
			);
		}

		return () => (
			<div
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '4px',
					justifyContent: 'space-between',
				}}
			>
				{renderSetter()}
				<Title
					title={{
						icon: <VariableIcon />,
						tip: '变量绑定',
					}}
					onClick={() => {
						event.emit('variableBindModal.openModal', {
							field: {
								getValue,
								setValue,
							},
							scope: 'state.',
						});
					}}
					className={isVariableBinded.value ? 'variable-binded' : ''}
				></Title>
			</div>
		);
	},
});

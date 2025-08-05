import { Button, Popover } from 'ant-design-vue';
import { computed, defineComponent, PropType } from 'vue';
import { IPublicModelSettingField } from '@arvin-shu/microcode-types';
import { convertSyntaxTreeToHQL } from '../../../materials/expression-builder/utils';
import { ExpressionBuilder } from '../../../materials';

export const ExpressionSetter = defineComponent({
	name: 'ExpressionSetter',
	emits: ['change'],
	props: {
		field: {
			type: Object as PropType<IPublicModelSettingField>,
		},
		value: {
			type: Object as PropType<{
				syntaxTree: any;
				hql: {
					expression: string;
					ordinalParams: any;
				};
			}>,
		},
	},
	setup(props, { emit }) {
		const targetClass = computed(() =>
			props.field?.parent?.getPropValue('targetClass')
		);

		const expr = computed({
			get() {
				return props.value?.syntaxTree;
			},
			set(value) {
				if (!value) {
					return emit('change', null);
				}
				if (value.length === 0) {
					return emit('change', null);
				}
				emit('change', {
					syntaxTree: value,
					hql: convertSyntaxTreeToHQL(value?.[0]),
				});
			},
		});

		const renderContent = () => (
			<ExpressionBuilder
				v-model:value={expr.value}
				targetClass={targetClass.value}
			/>
		);
		return () => (
			<Popover
				arrow={false}
				destroyTooltipOnHide
				trigger="click"
				placement="left"
				content={renderContent()}
			>
				<Button
					type={expr.value ? 'primary' : 'default'}
					style={{ width: '100%' }}
				>
					设置查询语句
				</Button>
			</Popover>
		);
	},
});

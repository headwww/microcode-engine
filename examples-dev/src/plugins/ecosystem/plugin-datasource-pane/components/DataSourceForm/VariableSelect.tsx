import { project } from '@arvin-shu/microcode-engine';
import { computed, defineComponent, PropType } from 'vue';
import { Select } from 'ant-design-vue';

export const VariableSelect = defineComponent({
	name: 'VariableSelect',
	props: {
		value: {
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
				type: 'JSExpression',
				value,
			};
		}

		const exportSchema = computed(() => project.exportSchema());

		function getVarableList() {
			const schema = exportSchema.value;
			const stateMap = schema.componentsTree[0]?.state;
			const dataSource = [];
			for (const key in stateMap) {
				if (Object.prototype.hasOwnProperty.call(stateMap, key) && key) {
					dataSource.push({
						key: `this.state.$data.${key}`,
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
						key: `this.state.${key}()`,
						title: key,
					});
				}
			}

			return methods;
		}

		return () => (
			<Select allowClear showSearch v-model:value={value.value}>
				<Select.OptGroup label="变量">
					{getVarableList().map((item) => (
						<Select.Option key={item.key} value={item.key}>
							{item.key}
						</Select.Option>
					))}
				</Select.OptGroup>
				<Select.OptGroup label="方法">
					{getMethods().map((item) => (
						<Select.Option key={item.key} value={item.key}>
							{item.key}
						</Select.Option>
					))}
				</Select.OptGroup>
			</Select>
		);
	},
});

import { computed, defineComponent, PropType } from 'vue';
import { Button, Form, Input, Switch } from 'ant-design-vue';
import { InterpretDataSourceConfig as DataSourceConfig } from '@arvin-shu/microcode-datasource-types';

import './form.scss';

export const DataSourceForm = defineComponent({
	name: 'DataSourceForm',
	inheritAttrs: false,
	emits: ['update:open', 'update:value'],
	props: {
		value: {
			type: Object as PropType<DataSourceConfig>,
		},
		open: {
			type: Boolean,
		},
	},
	setup(props, { emit }) {
		const labelCol = { style: { width: '71px' } };

		const open = computed({
			get: () => props.open,
			set: (value) => {
				emit('update:open', value);
			},
		});

		const value = computed({
			get: () => props.value || ({} as DataSourceConfig),
			set: (value) => {
				emit('update:value', value);
			},
		});

		return () => (
			<div
				style={{ display: open.value ? 'flex' : 'none' }}
				class="datasource-form-wrapper"
			>
				<div class="datasource-form-header">
					<span class="datasource-form-header-title">编辑数据源</span>
					<span>
						<Button type="primary">保存</Button>
						<Button
							style={{ marginLeft: '10px' }}
							onClick={() => {
								open.value = false;
							}}
						>
							关闭
						</Button>
					</span>
				</div>
				<div class="datasource-form-content">
					<Form model={value.value} labelCol={labelCol}>
						<Form.Item
							name="id"
							label="名称"
							rules={[
								{
									validator: (_, value) => {
										if (/[\u4e00-\u9fa5]/.test(value)) {
											return Promise.reject(new Error('禁止使用中文字符'));
										}
										return Promise.resolve();
									},
								},
							]}
						>
							<Input v-model:value={value.value.id}></Input>
						</Form.Item>
						<Form.Item name="description" label="描述">
							<Input v-model:value={value.value.description}></Input>
						</Form.Item>
						<Form.Item name="isInit" label="自动加载">
							<Switch v-model:checked={value.value.isInit}></Switch>
						</Form.Item>
					</Form>
				</div>
			</div>
		);
	},
});

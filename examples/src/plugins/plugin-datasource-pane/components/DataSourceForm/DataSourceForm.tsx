import {
	Button,
	Form,
	Input,
	Tooltip,
	Switch,
	Textarea,
	Segmented,
	Dropdown,
	Menu,
	Space,
} from 'ant-design-vue';
import { computed, defineComponent, PropType, ref, watch } from 'vue';
import { InterpretDataSourceConfig as DataSourceConfig } from '@arvin-shu/microcode-datasource-types';
import { cloneDeep, set } from 'lodash';
import { VariableSelect } from './VariableSelect';
import { AddIcon } from '../../icons/add';
import {
	monacoEditorConfigs,
	transformDataSourceFuncList,
} from './jsDefaultValue';

import './form.scss';
import { JsMonacoEditor } from './JsMonacoEditor';
import { DeleteIcon } from '../../icons/delete';

export const DataSourceForm = defineComponent({
	name: 'DataSourceForm',
	inheritAttrs: false,
	emits: ['update:open', 'update:value', 'delete'],
	props: {
		mode: {
			type: String as PropType<'create' | 'edit' | 'copy' | 'delete'>,
			default: 'edit',
		},
		open: {
			type: Boolean,
			default: false,
		},
		value: {
			type: Object as PropType<DataSourceConfig>,
		},
	},
	setup(props, { emit }) {
		const open = computed({
			get() {
				return props.open;
			},
			set(value) {
				emit('update:open', value);
			},
		});

		const title = computed(() => {
			if (props.mode === 'create') {
				return '创建数据源';
			}
			if (props.mode === 'edit') {
				return '编辑数据源';
			}
			if (props.mode === 'copy') {
				return '复制数据源';
			}
			return '编辑数据源';
		});

		const formState = ref<DataSourceConfig>(cloneDeep(props.value)!);

		// 数据源上几种处理器,shouldFetch,willFetch,dataHandler,errorHandler
		const dataSourceFuncList = ref(
			props.value ? transformDataSourceFuncList(props.value) : []
		);

		watch(
			() => props.value,
			(newValue) => {
				formState.value = cloneDeep(newValue)!;
			},
			{ deep: true }
		);

		watch(
			// @ts-ignore
			() => formState.value,
			(newValue) => {
				dataSourceFuncList.value = newValue
					? transformDataSourceFuncList(newValue)
					: [];
			},
			{
				deep: true,
			}
		);

		const handleUpdate = (key: string, value: any) => {
			// @ts-ignore
			set(formState.value, key, value);
			if (props.mode === 'edit') {
				emit('update:value', formState.value);
			}
		};

		const formSchem = computed(() => [
			{
				key: 'id',
				label: '名称',
				tip: '唯一的标识符，不能包含中文字符',
				rules: [
					{
						required: true,
						message: '名称不能为空',
					},
					{
						validator: (_: any, value: any) => {
							if (/[\u4e00-\u9fa5]/.test(value)) {
								return Promise.reject(new Error('禁止使用中文字符'));
							}
							return Promise.resolve();
						},
					},
				],
				component: (
					<Input
						value={formState.value.id}
						onUpdate:value={(value) => handleUpdate('id', value)}
					></Input>
				),
			},
			{
				key: 'description',
				label: '描述',
				component: (
					<Input
						value={formState.value.description}
						onUpdate:value={(value) => handleUpdate('description', value)}
					></Input>
				),
			},
			{
				key: 'isInit',
				label: '自动加载',
				tip: '是否在页面加载时自动加载数据，默认关闭。',
				component: (
					<Switch
						checked={formState.value.isInit as boolean}
						onUpdate:checked={(value) => handleUpdate('isInit', value)}
					></Switch>
				),
			},
			{
				key: ['options', 'uri'],
				label: '请求地址',
				tip: '是否在页面加载时同步加载数据，默认关闭。',
				rules: [
					{
						required: true,
						message: '请求地址不能为空',
					},
				],
				component: (
					<Textarea
						value={formState.value.options?.uri as string}
						onUpdate:value={(value) => handleUpdate('options.uri', value)}
						autoSize={{ minRows: 3, maxRows: 5 }}
					></Textarea>
				),
			},
			{
				key: ['options', 'params'],
				label: '请求参数',
				component: (
					<VariableSelect
						value={formState.value.options?.params}
						onUpdate:value={(value) => handleUpdate('options.params', value)}
					></VariableSelect>
				),
			},
			{
				key: ['options', 'method'],
				label: '请求方式',
				component: (
					<Segmented
						block
						options={['GET', 'POST', 'PUT', 'DELETE']}
						value={formState.value.options?.method as string}
						onUpdate:value={(value) => handleUpdate('options.method', value)}
					></Segmented>
				),
			},
		]);

		const renderLabel = (label: string, tip?: string) => (
			<div>
				<Tooltip title={tip}>
					<span
						style={{
							textDecoration: tip ? 'underline' : 'none',
							textDecorationStyle: 'dashed',
						}}
					>
						{label}
					</span>
				</Tooltip>
			</div>
		);

		const handleAddFunc = (item: any) => {
			if (dataSourceFuncList.value.some((func) => func.key === item.key)) {
				return;
			}
			handleUpdate(item.key, item.value);
		};

		return () => {
			if (open.value) {
				return (
					<div class="datasource-form-wrapper">
						<div class="datasource-form-header">
							<span class="datasource-form-header-title">{title.value}</span>
							{props.mode === 'create' || props.mode === 'copy' ? (
								<Space>
									<Button
										onClick={() => {
											emit('update:value', formState.value);
										}}
										type="primary"
									>
										保存
									</Button>
									<Button
										onClick={() => {
											open.value = false;
											emit('delete');
										}}
									>
										删除
									</Button>
								</Space>
							) : (
								<Button
									onClick={() => {
										open.value = false;
									}}
								>
									关闭
								</Button>
							)}
						</div>
						<div class="datasource-form-content">
							<Form
								model={formState.value}
								labelCol={{ style: { width: '80px' } }}
							>
								{formSchem.value.map((item) => (
									<Form.Item
										key={
											Array.isArray(item.key) ? item.key.join('.') : item.key
										}
										name={item.key}
										label={renderLabel(item.label, item.tip)}
										rules={item.rules}
									>
										{item.component}
									</Form.Item>
								))}
							</Form>
							<div class="datasource-func-wrapper">
								<div class="datasource-func-header">
									<span>数据处理器:</span>
									<Dropdown>
										{{
											default: () => (
												<Button
													size="small"
													icon={<AddIcon></AddIcon>}
												></Button>
											),
											overlay: () => (
												<Menu>
													{monacoEditorConfigs.map((item) => (
														<Menu.Item key={item.key}>
															<div onClick={() => handleAddFunc(item)}>
																{item.label}
															</div>
														</Menu.Item>
													))}
												</Menu>
											),
										}}
									</Dropdown>
								</div>
								<div class="datasource-func-list">
									{dataSourceFuncList.value.map((item: any) => (
										<div class="datasource-func-item" key={item.key}>
											<div class="datasource-func-item-title">
												{item.label}
												<Button
													type="text"
													icon={<DeleteIcon></DeleteIcon>}
													onClick={() => handleUpdate(item.key, null)}
												></Button>
											</div>
											<JsMonacoEditor
												value={item.value}
												onUpdate:value={(v) => {
													handleUpdate(item.key, v);
												}}
											></JsMonacoEditor>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				);
			}
			return null;
		};
	},
});

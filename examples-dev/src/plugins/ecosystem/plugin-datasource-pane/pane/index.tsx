import {
	IPublicApiProject,
	IPublicApiSkeleton,
	IPublicEnumTransformStage,
} from '@arvin-shu/microcode-types';
import { cloneDeep, get, isEmpty, set } from 'lodash';
import {
	computed,
	defineComponent,
	onMounted,
	PropType,
	ref,
	toRaw,
	watch,
} from 'vue';
import {
	InterpretDataSource as DataSource,
	InterpretDataSourceConfig as DataSourceConfig,
} from '@arvin-shu/microcode-datasource-types';
import { Button, message } from 'ant-design-vue';
import { correctSchema, isSchemaValid } from '../utils';
import {
	DataSourceFilter,
	DataSourceForm,
	DataSourceList,
	IDataSourceFilter,
} from '../components';

import './pane.scss';
import { intl } from '../locale';

export const DataSourcePaneWrapper = defineComponent({
	name: 'DataSourcePaneWrapper',
	inheritAttrs: false,
	props: {
		project: {
			type: Object as PropType<IPublicApiProject>,
		},
		skeleton: {
			type: Object as PropType<IPublicApiSkeleton>,
		},
		requireConfig: {
			type: Object as PropType<any>,
		},
	},
	setup(props) {
		const { project } = props;
		const projectSchema =
			project?.exportSchema(IPublicEnumTransformStage.Save) ?? {};
		let schema = null;
		if (!schema) {
			schema = get(projectSchema, 'componentsTree[0].dataSource');
		}
		// 发现不合法的 schema 进行纠正
		if (!isSchemaValid(schema)) {
			schema = correctSchema(schema);
		}
		const dataSource = ref<DataSourceConfig[]>(schema?.list ?? []);

		onMounted(() => {
			const { skeleton } = props;

			skeleton?.onHidePanel((paneName) => {
				if (paneName === 'dataSourcePane') {
					hide();
				}
			});
		});

		function hide() {
			const { project } = props;
			if (project) {
				const docSchema = project.exportSchema(IPublicEnumTransformStage.Save);
				if (!isEmpty(docSchema)) {
					set(docSchema, 'componentsTree[0].dataSource', {
						list: toRaw(dataSource.value),
					});
					project.importSchema(docSchema);
				}
			}
		}

		function handleSchemaChange(data: DataSourceConfig[]) {
			dataSource.value = [...data];
		}

		return () => {
			const { project } = props;
			const projectSchema =
				project?.exportSchema(IPublicEnumTransformStage.Save) ?? {};
			let schema = null;
			if (!schema) {
				schema = get(projectSchema, 'componentsTree[0].dataSource');
			}
			// 发现不合法的 schema 进行纠正
			if (!isSchemaValid(schema)) {
				schema = correctSchema(schema);
			}

			return (
				<DataSourcePane
					requireConfig={props.requireConfig}
					initialSchema={schema}
					onSchemaChange={handleSchemaChange}
				/>
			);
		};
	},
});

export const DataSourcePane = defineComponent({
	name: 'DataSourcePane',
	inheritAttrs: false,
	emits: ['schemaChange'],
	props: {
		initialSchema: {
			type: Object as PropType<DataSource>,
		},
		requireConfig: {
			type: Object as PropType<any>,
		},
	},
	setup(props, { emit }) {
		const { initialSchema } = props;

		const dataSourceList = ref<any>(initialSchema?.list || []);

		const open = ref(false);

		const currentDataSource = ref<DataSourceConfig>();

		const mode = ref<'create' | 'edit' | 'copy' | 'delete'>('edit');

		function handleCreate() {
			if (mode.value === 'create' || mode.value === 'copy') {
				message.warning(intl('ExistUnsavedDataSource'));
				return;
			}
			open.value = true;
			mode.value = 'create';
			const newId = `dp_${Date.now().toString(36).toLowerCase()}`;
			const newDataSource = {
				id: newId,
				description: '',
				isInit: false,
				isSync: false,
				options: {
					uri: '',
					method: 'POST',
				},
				dataHandler: {
					type: 'JSFunction',
					value: 'function dataHandler(res) { \n\treturn res\n}\n',
				},
			};
			dataSourceList.value.push(newDataSource);
			currentDataSource.value =
				dataSourceList.value[dataSourceList.value.length - 1];
		}

		function handleAction({
			action,
			dataSource,
		}: {
			action: string;
			dataSource: DataSourceConfig;
		}) {
			if (action === 'edit') {
				if (mode.value === 'create' || mode.value === 'copy') {
					message.warning('存在未保存的数据源，请先保存！');
					return;
				}
				currentDataSource.value = { ...dataSource };
				mode.value = 'edit';
				open.value = true;
			}
			if (action === 'delete') {
				mode.value = 'delete';
				dataSourceList.value = dataSourceList.value.filter(
					(item: DataSourceConfig) => item.id !== dataSource.id
				);
				if (currentDataSource.value?.id === dataSource.id) {
					open.value = false;
				}
			}
			if (action === 'copy') {
				if (mode.value === 'create' || mode.value === 'copy') {
					message.warning('存在未保存的数据源，请先保存！');
					return;
				}
				mode.value = 'copy';
				const newDataSource = { ...dataSource };
				newDataSource.id = `dp_${Date.now().toString(36).toLowerCase()}`;
				dataSourceList.value.push(newDataSource);
				currentDataSource.value = newDataSource;
				open.value = true;
			}
		}

		const filter = ref<IDataSourceFilter>({
			method: 'ALL',
			keyword: '',
		});

		const filteredDataSources = computed(() =>
			dataSourceList.value.filter((item: any) => {
				// 根据关键字筛选
				const description: string = (item?.description as string) || '';
				const matchKeyword = filter.value.keyword
					? description
							.toLowerCase()
							.includes(filter.value.keyword.toLowerCase()) ||
						item.id.toLowerCase().includes(filter.value.keyword.toLowerCase())
					: true;
				// 根据请求方法筛选
				const matchMethod =
					filter.value.method === 'ALL'
						? true
						: item.options?.method === filter.value.method;

				return matchKeyword && matchMethod;
			})
		);

		const isFiltering = computed(
			() => filter.value.keyword !== '' || filter.value.method !== 'ALL'
		);

		watch(
			dataSourceList,
			(v) => {
				emit('schemaChange', v);
			},
			{
				deep: true,
			}
		);

		return () => (
			<div class="datasource-pane">
				<div class="datasource-pane-header">{intl('DataSource')}</div>
				<DataSourceFilter v-model:filter={filter.value}></DataSourceFilter>
				<Button
					class="datasource-pane-create-button"
					type="primary"
					onClick={handleCreate}
				>
					{intl('Create')}
				</Button>
				<DataSourceList
					draggable={!isFiltering.value}
					value={currentDataSource.value}
					onUpdate:value={(v) => {
						if (mode.value === 'edit') {
							currentDataSource.value = v;
						}
					}}
					dataSources={filteredDataSources.value}
					onUpdate:dataSources={(v) => {
						dataSourceList.value = v;
					}}
					onAction={handleAction}
				/>
				<DataSourceForm
					requireConfig={props.requireConfig}
					v-model:open={open.value}
					value={currentDataSource.value}
					mode={mode.value}
					onUpdate:value={(value) => {
						mode.value = 'edit';
						const newDataSource = cloneDeep(value);
						const index = dataSourceList.value.findIndex(
							(item: DataSourceConfig) =>
								item.id === currentDataSource.value?.id
						);
						if (index !== -1) {
							currentDataSource.value = newDataSource;
							dataSourceList.value[index] = newDataSource;
						}
					}}
					onDelete={() => {
						dataSourceList.value = dataSourceList.value.filter(
							(item: DataSourceConfig) =>
								item.id !== currentDataSource.value?.id
						);
						mode.value = 'delete';
						open.value = false;
					}}
				/>
			</div>
		);
	},
});

import {
	IPublicApiEvent,
	IPublicApiProject,
	IPublicEnumTransformStage,
} from '@arvin-shu/microcode-types';
import { cloneDeep, get } from 'lodash';
import { computed, defineComponent, PropType, ref } from 'vue';
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

export const DataSourcePaneWrapper = defineComponent({
	name: 'DataSourcePaneWrapper',
	inheritAttrs: false,
	props: {
		project: {
			type: Object as PropType<IPublicApiProject>,
		},
		event: {
			type: Object as PropType<IPublicApiEvent>,
		},
	},
	setup(props) {
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
			return <DataSourcePane initialSchema={schema} />;
		};
	},
});

export const DataSourcePane = defineComponent({
	name: 'DataSourcePane',
	inheritAttrs: false,
	props: {
		initialSchema: {
			type: Object as PropType<DataSource>,
		},
	},
	setup(props) {
		const { initialSchema } = props;

		const dataSourceList = ref<any>(initialSchema?.list || []);

		const open = ref(false);

		const currentDataSource = ref<DataSourceConfig>();

		const mode = ref<'create' | 'edit' | 'copy' | 'delete'>('edit');

		function handleCreate() {
			if (mode.value === 'create' || mode.value === 'copy') {
				message.warning('存在未保存的数据源，请先保存！');
				return;
			}
			open.value = true;
			mode.value = 'create';
			const newId = `dp_${Date.now().toString(36).toLowerCase()}`;
			const newDataSource: DataSourceConfig = {
				id: newId,
				description: '',
				isInit: true,
				isSync: false,
				options: {
					uri: '',
					method: 'POST',
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
			dataSourceList.value.filter((item: DataSourceConfig) => {
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

		return () => (
			<div class="datasource-pane">
				<div class="datasource-pane-header">数据源</div>
				<DataSourceFilter v-model:filter={filter.value}></DataSourceFilter>
				<Button
					class="datasource-pane-create-button"
					type="primary"
					onClick={handleCreate}
				>
					创建
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

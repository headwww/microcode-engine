import {
	IPublicApiEvent,
	IPublicApiProject,
	IPublicEnumTransformStage,
} from '@arvin-shu/microcode-types';
import { get } from 'lodash';
import { defineComponent, PropType, ref } from 'vue';
import {
	InterpretDataSource as DataSource,
	InterpretDataSourceConfig as DataSourceConfig,
} from '@arvin-shu/microcode-datasource-types';
import { Button } from 'ant-design-vue';
import { correctSchema, isSchemaValid } from '../utils';
import {
	DataSourceFilter,
	DataSourceForm,
	DataSourceList,
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

		const dataSourceList = ref<Array<DataSourceConfig>>(
			initialSchema?.list || []
		);

		const open = ref(false);

		const currentDataSource = ref();

		function handleCreate() {
			open.value = true;
			const newId = `dp_${Date.now().toString(36).toLowerCase()}`;
			const newDataSource: DataSourceConfig = {
				id: newId,
				description: '',
				isInit: true,
				isSync: false,
			};
			// @ts-check
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
				currentDataSource.value = dataSource;
				open.value = true;
			}
			if (action === 'delete') {
				dataSourceList.value = dataSourceList.value.filter(
					(item) => item.id !== dataSource.id
				);
				if (currentDataSource.value?.id === dataSource.id) {
					open.value = false;
				}
			}
			if (action === 'copy') {
				const newDataSource = { ...dataSource };
				newDataSource.id = `dp_${Date.now().toString(36).toLowerCase()}`;
				dataSourceList.value.push(newDataSource);
				currentDataSource.value = newDataSource;
				open.value = true;
			}
		}

		return () => (
			<div class="datasource-pane">
				<div class="datasource-pane-header">数据源</div>
				<DataSourceFilter></DataSourceFilter>
				<Button
					class="datasource-pane-create-button"
					type="primary"
					onClick={handleCreate}
				>
					创建
				</Button>
				<DataSourceList
					v-model:value={currentDataSource.value}
					dataSource={dataSourceList.value}
					onAction={handleAction}
				/>
				{open.value && (
					<DataSourceForm
						v-model:open={open.value}
						value={currentDataSource.value}
					/>
				)}
			</div>
		);
	},
});

import { PropType, computed, defineComponent } from 'vue';
import { InterpretDataSourceConfig as DataSourceConfig } from '@arvin-shu/microcode-datasource-types';
import { VueDraggable } from 'vue-draggable-plus';
import { MoveIcon } from '../../icons/move';
import { EditIcon } from '../../icons/edit';
import { CopyIcon } from '../../icons/copy';
import { DeleteIcon } from '../../icons/delete';
import './list.scss';

export const DataSourceList = defineComponent({
	name: 'DataSourceList',
	inheritAttrs: false,
	emits: ['action', 'update:value', 'update:dataSources'],
	props: {
		draggable: {
			type: Boolean,
			default: true,
		},
		dataSources: {
			type: Array as PropType<DataSourceConfig[]>,
		},
		value: {
			type: Object as PropType<DataSourceConfig>,
		},
	},
	setup(props, { emit }) {
		const dataSourceList = computed({
			get() {
				return props.dataSources as DataSourceConfig[];
			},
			set(value) {
				emit('update:dataSources', value);
			},
		});

		const value = computed({
			get() {
				return props.value;
			},
			set(value) {
				emit('update:value', value);
			},
		});

		function handleEdit(dataSource: DataSourceConfig) {
			value.value = dataSource;
			emit('action', {
				action: 'edit',
				dataSource,
			});
		}

		function handleCopy(dataSource: DataSourceConfig) {
			emit('action', {
				action: 'copy',
				dataSource,
			});
		}

		function handleDelete(dataSource: DataSourceConfig) {
			emit('action', {
				action: 'delete',
				dataSource,
			});
		}

		return () => (
			<VueDraggable
				tag="div"
				modelValue={dataSourceList.value}
				onUpdate:modelValue={(value: any) => {
					dataSourceList.value = value;
				}}
				class="datasource-list"
				handle=".datasource-list-item-handle"
				ghostClass="datasource-list-item-ghost"
			>
				{dataSourceList.value.map((item) => (
					<div
						key={item.id}
						class={`datasource-list-item ${
							value.value?.id === item.id ? 'active' : ''
						}`}
					>
						<div class="datasource-list-item-title">
							{props.draggable && (
								<MoveIcon class="datasource-list-item-handle move"></MoveIcon>
							)}
							<div class="datasource-list-item-title-content">
								<span class="datasource-list-item-title-content-text">
									{item.description}
								</span>
								<div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
									<span
										class="datasource-list-item-title-content-text"
										style="font-size: 12px; color: #999; opacity: 0.8"
									>
										ID：
									</span>
									<span
										class="datasource-list-item-title-content-text"
										style="font-size: 12px; color: #999"
									>
										{item.id}
									</span>
								</div>
							</div>
						</div>
						<div class="datasource-list-item-actions">
							<EditIcon
								onClick={() => handleEdit(item)}
								class="datasource-list-item-action-edit"
							></EditIcon>
							<CopyIcon
								onClick={() => handleCopy(item)}
								class="datasource-list-item-action-copy"
							></CopyIcon>
							<DeleteIcon
								onClick={() => handleDelete(item)}
								class="datasource-list-item-action-delete"
							></DeleteIcon>
						</div>
					</div>
				))}
			</VueDraggable>
		);
	},
});

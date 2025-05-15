import { computed, defineComponent, PropType, ref } from 'vue';
import { Button, Segmented, TreeProps } from 'ant-design-vue';
import { VxeGlobalRendererHandles } from 'vxe-pc-ui';
import { get } from 'xe-utils';
import { FilterMode } from './types';

import FilterText from './components/filter-text';
import FilterNumber from './components/filter-number';
import FilterDate from './components/filter-date';
import { formatTableCell } from '../utils';
import './style.scss';
import FilterContent from './components/filter-content';
import EntitySelector from '../../entity-selector';

export const AdvancedFilter = defineComponent({
	name: 'LtAdvancedFilter',
	props: {
		// 开启的筛选的模式
		filterModes: Array<FilterMode>,
		// 当前选中的筛选模式
		currentMode: {
			type: String as PropType<FilterMode>,
			default: '',
		},
		dataType: {
			type: String,
		},
		dateFormatter: {
			type: String,
			default: 'YYYY-MM-DD HH:mm:ss',
		},
		timeFormatter: {
			type: String,
			default: 'HH:mm:ss',
		},
		options: {
			type: Array as PropType<
				{
					label: string;
					value: string;
				}[]
			>,
		},
		filterColumns: {
			type: Array as PropType<any[]>,
			default: () => [],
		},
		filterDataConfig: {
			type: Object,
		},
		params: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderTableFilterParams>,
			required: true,
		},
	},
	setup(props) {
		const entitySelectRef = ref();

		/** 选中的筛选模式 */
		const getFilterModes = computed(() => {
			const { filterModes } = props;
			if (filterModes) {
				return filterModes;
			}
			return [FilterMode.TEXT, FilterMode.CONTENT];
		});

		const filters = computed(() => props.params?.column?.filters || []);

		const contentOptions = computed((): TreeProps['treeData'] => {
			const { column, $table } = props.params;
			const data = $table?.getData();
			if (props.options && props.options.length > 0) {
				return [
					{
						key: '$SELECT_ALL',
						title: '全选',
						children: [
							{
								key: '$SELECT_NULL',
								title: '空白',
							},
							...props.options.map((item) => ({
								key: item.label,
								title: item.label,
							})),
						],
					},
				];
			}
			const opts = Array.from(
				new Map(
					data.map((item: any) => {
						const value = formatTableCell({
							cellValue: get(item, column.field),
							row: item,
							column,
						});
						return [value, { key: value, title: value }];
					})
				).values()
			);

			return [
				{
					key: '$SELECT_ALL',
					title: '全选',
					children: [
						{
							key: '$SELECT_NULL',
							title: '空白',
						},
						...opts,
					],
				},
			];
		});

		// 当前选中的筛选模式
		const currentMode = computed({
			get() {
				return filters.value[0]?.data.currentMode;
			},
			set(value: string) {
				filters.value[0].data.currentMode = value;
			},
		});

		const textFilterData = computed({
			get() {
				return filters.value[0]?.data.textFilterData;
			},
			set(value: any) {
				filters.value[0].data.textFilterData = value;
			},
		});

		const dateFilterData = computed({
			get() {
				return filters.value[0]?.data.dateFilterData;
			},
			set(value: any) {
				filters.value[0].data.dateFilterData = value;
			},
		});

		const numberFilterData = computed({
			get() {
				return filters.value[0]?.data.numberFilterData;
			},
			set(value: any) {
				filters.value[0].data.numberFilterData = value;
			},
		});

		const contentFilterData = computed({
			get() {
				return filters.value[0]?.data.contentFilterData;
			},
			set(value: any) {
				filters.value[0].data.contentFilterData = value;
			},
		});

		/** 重置 */
		const onResetFilterEvent = () => {
			const { params } = props;

			if (params) {
				const { $panel } = params;
				$panel.resetFilter();
			}
		};

		/** 筛选 */
		const onFilterEvent = () => {
			const { params } = props;
			if (currentMode.value === FilterMode.ENTITY) {
				filters.value[0].data.entityFilterData = {
					records: entitySelectRef.value
						?.getTableInstance()
						?.getCheckboxRecords(),
				};
			}
			if (params) {
				const { $panel } = params;
				$panel.changeOption(null, true, filters.value[0]);
				$panel?.confirmFilter();
			}
		};

		return () => (
			<div class="lt-advanced-filter">
				<Segmented
					block
					v-model:value={currentMode.value}
					options={props.filterModes}
				/>

				<div style="flex: 1">
					{getFilterModes.value.map((mode) => (
						<div v-show={currentMode.value === mode} key={mode}>
							{mode === FilterMode.TEXT && (
								<FilterText v-model:value={textFilterData.value} />
							)}
							{mode === FilterMode.NUMBER && (
								<FilterNumber v-model:value={numberFilterData.value} />
							)}
							{mode === FilterMode.DATE && (
								<FilterDate
									dateType={props.dataType}
									dateFormatter={props.dateFormatter}
									timeFormatter={props.timeFormatter}
									v-model:value={dateFilterData.value}
								/>
							)}
							{mode === FilterMode.CONTENT && (
								<FilterContent
									options={contentOptions.value}
									v-model:value={contentFilterData.value}
								/>
							)}
							{mode === FilterMode.ENTITY && (
								<EntitySelector
									ref={entitySelectRef}
									height={200}
									dataConfig={props.filterDataConfig}
									columns={props.filterColumns}
								/>
							)}
						</div>
					))}
				</div>

				<div class="lt-advanced-filter-footer">
					<Button onClick={onResetFilterEvent}>重置</Button>
					<Button onClick={onFilterEvent}>筛选</Button>
				</div>
			</div>
		);
	},
});

import { computed, defineComponent, PropType } from 'vue';
import { Button, Segmented } from 'ant-design-vue';
import { VxeGlobalRendererHandles } from 'vxe-pc-ui';
import { FilterMode } from './types';

import './style.scss';
import FilterText from './components/filter-text';
import FilterNumber from './components/filter-number';
import FilterDate from './components/filter-date';

export const AdvancedFilter = defineComponent({
	name: 'LtAdvancedFilter',
	emits: ['change'],
	props: {
		// 开启的筛选的模式
		filterModes: Array<FilterMode>,
		// 当前选中的筛选模式
		currentMode: {
			type: String as PropType<FilterMode>,
			default: '',
		},
		params: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderTableFilterParams>,
			required: true,
		},
	},
	setup(props, { emit }) {
		/** 选中的筛选模式 */
		const getFilterModes = computed(() => {
			const { filterModes } = props;
			if (filterModes) {
				return filterModes;
			}
			return [FilterMode.TEXT, FilterMode.CONTENT];
		});

		const filters = computed(() => props.params?.column?.filters || []);

		const field = computed(() => props.params?.column?.field);

		// 当前选中的筛选模式
		const currentMode = computed({
			get() {
				return filters.value.find((item) => item.label === field.value)?.data
					.currentMode;
			},
			set(value: string) {
				const filter = filters.value.find((item) => item.label === field.value);
				if (filter) {
					filter.data.currentMode = value;
				}
				emit('change', filters.value);
			},
		});

		const textFilterData = computed({
			get() {
				return filters.value.find((item) => item.label === field.value)?.data
					.textFilterData;
			},
			set(value: any) {
				const filter = filters.value.find((item) => item.label === field.value);
				if (filter) {
					filter.data.textFilterData = value;
				}
				emit('change', filters.value);
			},
		});

		const dateFilterData = computed({
			get() {
				return filters.value.find((item) => item.label === field.value)?.data
					.dateFilterData;
			},
			set(value: any) {
				const filter = filters.value.find((item) => item.label === field.value);
				if (filter) {
					filter.data.dateFilterData = value;
				}
				emit('change', filters.value);
			},
		});

		const numberFilterData = computed({
			get() {
				return filters.value.find((item) => item.label === field.value)?.data
					.numberFilterData;
			},
			set(value: any) {
				const filter = filters.value.find((item) => item.label === field.value);
				if (filter) {
					filter.data.numberFilterData = value;
				}
				emit('change', filters.value);
			},
		});

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
								<FilterDate v-model:value={dateFilterData.value} />
							)}
						</div>
					))}
				</div>

				<div class="lt-advanced-filter-footer">
					<Button>重置</Button>
					<Button>筛选</Button>
				</div>
			</div>
		);
	},
});

import { Input, Popover } from 'ant-design-vue';
import {
	defineComponent,
	PropType,
	Fragment,
	computed,
	ref,
	onMounted,
	reactive,
	watch,
} from 'vue';
import { VxeGrid, VxeGridProps } from 'vxe-table';
import { debounce, omit } from 'lodash-es';
import { ColumnProps, DataConfig } from './types';
// TODO 需要替换为实际的http请求
import { http } from '../../../utils/http';

export default defineComponent({
	name: 'LtEntitySelector',
	props: {
		// 模式是在Input下面有一个table还是点击input后有一个table弹出
		mode: {
			type: String as PropType<'default' | 'popover'>,
			default: 'default',
		},
		height: {
			type: [Number, String],
			default: 280,
		},
		placeholder: {
			type: String,
			default: '模糊查询',
		},
		columns: {
			type: Array as PropType<ColumnProps[]>,
			default: () => [],
		},
		dataConfig: {
			type: Object as PropType<DataConfig>,
		},
		onClear: {
			type: Function as PropType<(v: any) => void>,
			default: () => {},
		},
		// 选中的实体
		value: null,
	},
	setup(props) {
		const inputValue = ref('');

		const data = ref([]);

		const loading = ref(false);

		const pagerConfig = reactive({
			currentPage: 1,
			pageSize: 100,
			total: 0,
			layouts: [
				'PrevJump',
				'PrevPage',
				'Jump',
				'PageCount',
				'NextPage',
				'NextJump',
				'Sizes',
				'Total',
			],
			pageSizes: [
				10,
				20,
				100,
				200,
				500,
				1000,
				{ label: '全量数据', value: -1 },
			],
		});

		const columns = computed(() => {
			const { columns } = props;
			const cols = [];
			cols.push({
				type: 'seq',
				title: '序号',
				width: 50,
				fixed: 'left',
				align: 'center',
			});

			// 字段列
			const fields =
				columns?.filter(Boolean).map((item) => {
					const { tipContent } = item;

					const column = {
						...omit(item, [
							'dataType',
							'editType',
							'dateFormatter',
							'timeFormatter',
							'digits',
							'boolOptions',
							'enumOptions',
							'codeType',
							'tipContent',
						]),
						titleSuffix: tipContent
							? {
									content: tipContent,
								}
							: null,
					};
					return column as any;
				}) || [];

			cols.push(...fields);

			return cols;
		});

		watch(
			inputValue,
			debounce(() => {
				sendRequest();
			}, 500)
		);

		/**
		 * 可作为模糊查询用的字段
		 */
		const filterFields = computed(() =>
			props.columns
				?.filter((item) => item?.filterable)
				.map((item) => item?.field)
				.filter(Boolean)
		);

		// TODO 拼接请求体
		const request = () => {
			const { dataConfig, columns } = props;
			if (!dataConfig) {
				return Promise.reject(new Error('dataConfig is required'));
			}
			const {
				url,
				method,
				targetClass,
				pagination,
				// 前置表达式
				queryCondition,
			} = dataConfig;

			// 请求体 如果不是分页则就一个索引
			// 如果是分页组成为两个索引的数据，第一个索引是分页对象，第二个索引Condition对象
			const data = [];

			// 是否是分页请求
			pagination &&
				data.push({
					pageNo: pagerConfig.currentPage - 1,
					pageSize: pagerConfig.pageSize,
					rowCountEnabled: true,
				});

			// 表达式说明：
			// query - 前置表达式，由用户配置，用于限定查询范围
			// expr - 后置表达式，用于模糊查询
			// 例如：在仓库列表中，query1可以限定只查询A和B仓库，expr则在这些仓库中进行模糊搜索
			const condition: Record<string, any> = {};

			const expr = filterFields.value
				.map((field) => `this.${field} LIKE '%${inputValue.value}%'`)
				.join(' OR ');

			const expression = [queryCondition?.expression, expr]
				.filter(Boolean)
				.map((condition) => `(${condition})`)
				.join(' AND ');

			expression && (condition.expression = expression);

			const queryPath = columns.map((item) => item?.field).filter(Boolean);
			queryPath && (condition.queryPath = queryPath);

			targetClass && (condition.targetClass = targetClass);

			queryCondition?.ordinalParams &&
				(condition.ordinalParams = queryCondition.ordinalParams);

			data.push(condition);

			return http.request({
				url: url?.trim(),
				method,
				data,
			});
		};

		// TODO 发送请求 请求的参数还没设置fastjson
		const sendRequest = () => {
			if (
				props.dataConfig?.url?.trim() &&
				props.dataConfig?.targetClass?.trim()
			) {
				loading.value = true;
				request()
					.then((res) => {
						if (!props.dataConfig?.pagination) {
							data.value = res;
						} else {
							pagerConfig.total = res?.rowCount || 0;
							data.value = res?.result || [];
						}
					})
					.catch((err) => {
						// eslint-disable-next-line no-console
						console.error(err);
					})
					.finally(() => {
						loading.value = false;
					});
			}
		};

		onMounted(() => {
			if (props.mode === 'default') {
				sendRequest();
			}
		});

		const menuClick = () => {
			sendRequest();
		};

		const onPageChange = (params: any) => {
			pagerConfig.currentPage = params.currentPage;
			pagerConfig.pageSize = params.pageSize;
			sendRequest();
		};

		const renderTable = () => {
			const { height, dataConfig } = props;

			const basicProps: VxeGridProps = {
				height: height || 280,
				size: 'mini',
				round: true,
				border: true,
				stripe: true,
				showOverflow: true,
				showHeaderOverflow: true,
				showFooterOverflow: true,
				columnConfig: {
					resizable: true,
				},
				virtualYConfig: {
					enabled: true,
					gt: 0,
				},
				virtualXConfig: {
					enabled: true,
					gt: 0,
				},
			};
			const pager = dataConfig?.pagination
				? pagerConfig
				: {
						enabled: false,
					};
			return (
				<VxeGrid
					{...basicProps}
					loading={loading.value}
					columns={columns.value}
					menuConfig={{
						header: {
							options: [[{ code: 'refresh', name: '刷新' }]],
						},
						body: {
							options: [[{ code: 'refresh', name: '刷新' }]],
						},
					}}
					onMenuClick={menuClick}
					pagerConfig={pager as any}
					onPageChange={onPageChange}
					data={data.value}
				></VxeGrid>
			);
		};

		return () => {
			const { mode, placeholder } = props;

			return (
				<div style="width: 100%;">
					{mode === 'default' ? (
						<Fragment>
							<Input
								v-model:value={inputValue.value}
								placeholder={placeholder}
								allowClear
								onChange={(v) => {
									// 点击清除按钮
									if (v instanceof PointerEvent && v?.type === 'click') {
										props.onClear?.(v);
									}
								}}
							/>
							{renderTable()}
						</Fragment>
					) : (
						<Popover
							destroyTooltipOnHide
							trigger="click"
							placement="bottom"
							arrow={false}
							overlayStyle={{ width: '100%' }}
							overlayInnerStyle={{ padding: '0px', width: '100%' }}
							content={renderTable()}
							onOpenChange={() => {
								sendRequest();
							}}
						>
							<Input
								v-model:value={inputValue.value}
								placeholder={placeholder}
								allowClear
								onChange={(v) => {
									// 点击清除按钮
									if (v instanceof PointerEvent && v?.type === 'click') {
										props.onClear?.(v);
									}
								}}
							/>
						</Popover>
					)}
				</div>
			);
		};
	},
});

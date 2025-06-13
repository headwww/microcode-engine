import { Input, Popover, Tooltip } from 'ant-design-vue';
import {
	defineComponent,
	Fragment,
	computed,
	ref,
	onMounted,
	reactive,
	watch,
	nextTick,
} from 'vue';
import { VxeGrid, VxeGridInstance, VxeGridProps } from 'vxe-table';
import { debounce, get, omit } from 'lodash-es';
import { CloseCircleFilled } from '@ant-design/icons-vue';
import { entitySelectorProps } from './types';
// TODO 需要替换为实际的http请求
import { http } from '../../../utils/http';
import { useCellFormat, useCellRender } from '../table/render';
import './style.scss';

// 给table编辑使用的
export default defineComponent({
	name: 'LtEntitySelector',
	props: entitySelectorProps,
	setup(props, { expose }) {
		const tableRef = ref<VxeGridInstance>();

		const open = ref(false);

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
				type: props.mode === 'popover' ? 'radio' : 'checkbox',
				width: 40,
				fixed: 'left',
				align: 'center',
			});
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
					const { cellRender } = useCellRender(item);
					const { formatter } = useCellFormat(item);
					const column = {
						field: item.property?.fieldName,
						...omit(item, [
							'property',
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
						cellRender,
						titleSuffix: tipContent
							? {
									content: tipContent,
								}
							: null,
						params: {
							// TODO 格式化暂时先当作额外参数来设置，直接在formatter中设置会有问题
							formatter,
						},
					};
					return column as any;
				}) || [];

			cols.push(...fields);

			return cols;
		});

		const inputValue = ref(props.inputValue);

		watch(
			() => props.inputValue,
			(v) => {
				inputValue.value = v;
			}
		);

		watch(
			inputValue,
			debounce((v) => {
				if (props.mode === 'default') {
					sendRequest(v);
				} else {
					if (open.value) {
						sendRequest(v);
					}
				}
			}, 500)
		);

		const request = (v: any) => {
			const { dataConfig, columns } = props;
			if (!dataConfig) {
				return Promise.reject(new Error('dataConfig is required'));
			}
			const {
				url,
				method,
				targetClass,
				// 是否分页
				pagination,
				// 前置表达式
				expressionAndOrdinalParams,
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
			// 最后组装起来就是这样：this.id="s1232131231" AND this.code LIKE '%${inputValue.value}%'
			const condition: Record<string, any> = {};

			/**
			 * 可作为模糊查询用的字段
			 */
			const filterFields = props.columns
				?.filter((item) => item?.filterable)
				.map((item) => item?.property?.fieldName)
				.filter(Boolean);

			const expr = filterFields
				.map((field) => `this.${field} LIKE '%${v || ''}%'`)
				.join(' OR ');

			// 关联查询
			const relation = props.dataConfig
				?.relationFunc?.(props.params)
				.replace('__self', 'this');

			const expression = [
				relation,
				expressionAndOrdinalParams?.hql?.expression,
				expr,
			]
				.filter(Boolean)
				.map((condition) => `(${condition})`)
				.join(' AND ');

			expression && (condition.expression = expression);

			const queryPath = columns.map((item) => item?.field).filter(Boolean);
			queryPath && (condition.queryPath = queryPath);

			targetClass && (condition.targetClass = targetClass);

			expressionAndOrdinalParams?.hql?.ordinalParams &&
				(condition.ordinalParams =
					expressionAndOrdinalParams.hql.ordinalParams);

			data.push(condition);

			return http.request({
				url: url?.trim(),
				method,
				data,
			});
		};

		const sendRequest = (v: any) => {
			if (
				props.dataConfig?.url?.trim() &&
				props.dataConfig?.targetClass?.trim()
			) {
				loading.value = true;
				request(v)
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
				sendRequest('');
			}
		});

		const menuClick = () => {
			sendRequest(inputValue.value);
		};

		const onPageChange = (params: any) => {
			pagerConfig.currentPage = params.currentPage;
			pagerConfig.pageSize = params.pageSize;
			sendRequest('');
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
				rowConfig: {
					isHover: true,
				},
				radioConfig:
					props.mode === 'popover'
						? {
								highlight: true,
								trigger: 'row',
							}
						: undefined,
				checkboxConfig:
					props.mode === 'popover'
						? undefined
						: {
								highlight: true,
								trigger: 'row',
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
					ref={tableRef}
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
					emptyText=" "
					onRadioChange={(v) => {
						setTimeout(() => {
							open.value = false;
						}, 100);
						inputValue.value = props.path && get(v.row, props.path);
						props.onRadioChange?.(v);
					}}
				></VxeGrid>
			);
		};

		const renderSuffix = () => (
			<Tooltip title="删除该实体">
				<CloseCircleFilled
					onClick={(e) => {
						e.stopPropagation();
						props.onClear?.();
					}}
					onMousedown={(e) => {
						e.preventDefault(); // 阻止 Input 失焦
					}}
					class={['lt-entity-selector-suffix-icon']}
				/>
			</Tooltip>
		);

		expose({
			getTableInstance: () => tableRef.value,
		});

		const inputWidth = ref<string>('auto');
		const inputRef = ref<any>(); // 新增 inputRef

		watch(
			inputRef,
			(el) => {
				if (el) {
					nextTick(() => {
						inputWidth.value = `${el.$el.offsetWidth}px`;
					});
				}
			},
			{ immediate: true }
		);

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
							/>
							{renderTable()}
						</Fragment>
					) : (
						<Popover
							v-model:open={open.value}
							trigger="click"
							arrow={false}
							placement="bottomLeft"
							overlayStyle={{
								width: inputWidth.value,
								height: '325px',
								zIndex: 1010,
							}}
							overlayInnerStyle={{ padding: '0px' }}
							content={renderTable()}
							onOpenChange={(v) => {
								if (!v) {
									inputValue.value = props.inputValue;
								}
								v && sendRequest('');
							}}
						>
							<Input
								ref={inputRef}
								v-model:value={inputValue.value}
								placeholder={placeholder}
								allowClear={false}
								onFocus={() => {
									nextTick(() => {
										inputWidth.value = `${inputRef.value.$el.offsetWidth}px`;
									});
								}}
								suffix={renderSuffix()}
							/>
						</Popover>
					)}
				</div>
			);
		};
	},
});

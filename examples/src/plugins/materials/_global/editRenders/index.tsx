import { VxeGlobalRendererHandles, VxeUI } from 'vxe-pc-ui';
import { isObject, get, assign, set } from 'lodash-es';
import {
	DatePicker as ADatePicker,
	TimePicker as ATimePicker,
	Input,
	InputNumber,
	Select,
	Switch,
} from 'ant-design-vue';
import { objectEach } from 'xe-utils';
import dayjs from 'dayjs';
import { computed, defineComponent, PropType } from 'vue';
import {
	LtDefaultRenderTableCell,
	LtLinkRenderTableCell,
	LtCodeRenderTableCell,
	LtTagRenderTableCell,
} from '../cellRenders';
import { formatTableCell } from '../utils';
import EntitySelector from '../../entity-selector';

function getOnName(type: string) {
	return `on${type.substring(0, 1).toLocaleUpperCase()}${type.substring(1)}`;
}

interface RenderOptions {
	name: string;
	props: {
		dataType?: 'text' | 'link' | 'code' | 'boolean' | 'enum' | string;
		codeType?: 'qrCode' | 'barCode';
		options?: Array<{
			label: string;
			value: string;
			color?: string;
			[key: string]: any;
		}>;
	};
}

// 渲染器配置
const renderConfig = {
	link: (value: any) => <LtLinkRenderTableCell>{value}</LtLinkRenderTableCell>,
	code: (value: any, props: RenderOptions['props']) => (
		<LtCodeRenderTableCell code={value?.toString()} type={props.codeType} />
	),
	boolean: (value: any, props: RenderOptions['props']) => {
		const color = props.options?.find((item) => item.label === value)?.color;
		return <LtTagRenderTableCell color={color} value={value} />;
	},
	enum: (value: any, props: RenderOptions['props']) => {
		const color =
			props.options?.find((item) => item.label === value)?.color || 'default';
		return <LtTagRenderTableCell color={color} value={value} />;
	},

	default: (value: any) => (
		<LtDefaultRenderTableCell>{value}</LtDefaultRenderTableCell>
	),
};

/**
 * 表格单元格渲染函数
 */
function renderCellContent(
	renderOpts: RenderOptions,
	params: VxeGlobalRendererHandles.RenderTableEditParams
) {
	const { row, column } = params;
	let cellValue = get(row, column.field);
	// 格式化处理
	cellValue = formatTableCell({ cellValue, row, column });

	// 处理特殊情况
	if (isObject(cellValue)) {
		return <span style={{ color: 'red' }}>数据类型不符合</span>;
	}

	// 根据数据类型选择对应的渲染方法
	const dataType = renderOpts.props.dataType;
	const renderer =
		renderConfig[dataType as keyof typeof renderConfig] || renderConfig.default;

	return renderer(cellValue, renderOpts.props);
}

function getCellEditFilterProps(
	componentName: string,
	renderOpts: any,
	value: any,
	defaultProps?: { [prop: string]: any }
) {
	return assign({}, defaultProps, renderOpts.props, {
		[getModelProp(componentName)]: value,
	});
}

function getModelProp(name: string) {
	let prop = 'value';
	switch (name) {
		case 'ASwitch':
			prop = 'checked';
			break;
	}
	return prop;
}

function getModelEvent(name: string) {
	let type = 'update:value';
	switch (name) {
		case 'ASwitch':
			type = 'update:checked';
			break;
	}
	return type;
}

function getOns(
	componentName: string,
	renderOpts: VxeGlobalRendererHandles.RenderOptions,
	params: VxeGlobalRendererHandles.RenderParams,
	inputFunc?: Function,
	changeFunc?: Function
) {
	const { events } = renderOpts;
	const modelEvent = getModelEvent(componentName);
	const changeEvent = 'change';
	const isSameEvent = changeEvent === modelEvent;

	const ons: { [type: string]: Function } = {};
	objectEach(events, (func: Function, key: string) => {
		// eslint-disable-next-line func-names
		ons[getOnName(key)] = function (...args: any[]) {
			func(params, ...args);
		};
	});
	if (inputFunc) {
		// eslint-disable-next-line func-names
		ons[getOnName(modelEvent)] = function (targetEvnt: any) {
			inputFunc(targetEvnt);
			if (events && events[modelEvent]) {
				events[modelEvent](params, targetEvnt);
			}
			if (isSameEvent && changeFunc) {
				changeFunc(targetEvnt);
			}
		};
	}
	if (!isSameEvent && changeFunc) {
		// eslint-disable-next-line func-names
		ons[getOnName(changeEvent)] = function (...args: any[]) {
			changeFunc(...args);
			if (events && events[changeEvent]) {
				events[changeEvent](params, ...args);
			}
		};
	}
	return ons;
}

function getEditOns(
	componentName: string,
	renderOpts: VxeGlobalRendererHandles.RenderTableEditOptions,
	params: VxeGlobalRendererHandles.RenderTableEditParams
) {
	const { $table, row, column } = params;
	return getOns(
		componentName,
		renderOpts,
		params,
		(value: any) => {
			// 处理 model 值双向绑定
			set(row, column.field, value);
		},
		() => {
			// 处理 change 事件相关逻辑
			$table?.updateStatus(params);
		}
	);
}

function renderEditRender(Comp: any, defaultProps?: { [prop: string]: any }) {
	return (
		renderOpts: VxeGlobalRendererHandles.RenderTableEditOptions<any>,
		params: VxeGlobalRendererHandles.RenderTableEditParams<any>
	) => {
		const { attrs } = renderOpts;

		const { row, column } = params;
		const cellValue = get(row, column.field);

		return (
			<Comp
				{...attrs}
				{...getCellEditFilterProps(
					Comp.name,
					renderOpts,
					cellValue,
					defaultProps
				)}
				{...getEditOns(Comp.name, renderOpts, params)}
			></Comp>
		);
	};
}

// 根据格式判断picker类型
const getPickerType = (format: string) => {
	if (format.includes('HH') || format.includes('时')) {
		return 'date'; // 如果包含时间，使用date类型
	}
	if (format === 'YYYY' || format === 'YYYY年') {
		return 'year';
	}
	if (format.includes('MM') || format.includes('月')) {
		if (!format.includes('DD') && !format.includes('日')) {
			return 'month';
		}
		return 'date';
	}
	return 'date';
};

// 判断是否显示时间选择
const showTimeFormat = (format: string) => {
	if (format.includes('HH') || format.includes('时')) {
		// 根据格式创建时间选择的配置
		return {
			format: format.split(' ')[1], // 获取时间部分的格式
		};
	}
	return false;
};

const DataPicker = defineComponent({
	props: {
		renderOpts: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderTableEditOptions>,
			required: true,
		},
		params: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderTableEditParams>,
			required: true,
		},
	},
	setup(props) {
		const { renderOpts, params } = props;
		const { row, column, $table } = params;
		const picker = getPickerType(renderOpts.props.dateFormatter);
		const showTime = showTimeFormat(renderOpts.props.dateFormatter);

		const value = computed({
			get: () => {
				const cellValue = get(row, column.field);
				return cellValue ? dayjs(cellValue) : undefined;
			},
			set: (value) => {
				if (value == null) {
					set(row, column.field, null);
				} else {
					set(row, column.field, value.valueOf());
				}
				$table?.updateStatus(params);
			},
		});
		return () => (
			<ADatePicker
				picker={picker}
				showTime={showTime}
				format={renderOpts.props.dateFormatter}
				v-model:value={value.value}
			></ADatePicker>
		);
	},
});

const TimePicker = defineComponent({
	props: {
		renderOpts: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderTableEditOptions>,
			required: true,
		},
		params: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderTableEditParams>,
			required: true,
		},
	},
	setup(props) {
		const { renderOpts, params } = props;
		const { row, column, $table } = params;

		const value = computed({
			get: () => {
				const cellValue = get(row, column.field);
				return cellValue ? dayjs(cellValue) : undefined;
			},
			set: (value) => {
				if (value == null) {
					set(row, column.field, null);
				} else {
					set(row, column.field, value.valueOf());
				}
				$table?.updateStatus(params);
			},
		});
		return () => (
			<ATimePicker
				format={renderOpts.props.timeFormatter}
				v-model:value={value.value}
			></ATimePicker>
		);
	},
});

VxeUI.renderer.mixin({
	LtDefaultRenderTableEdit: {
		renderTableEdit: renderCellContent,
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},

	LtTextRenderTableEdit: {
		tableAutoFocus: 'input',
		renderTableEdit: renderEditRender(Input, {
			style: {
				width: '100%',
			},
			allowClear: true,
		}),
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},

	LtNumberRenderTableEdit: {
		tableAutoFocus: 'input',
		renderTableEdit: renderEditRender(InputNumber, {
			style: {
				width: '100%',
			},
			allowClear: true,
		}),
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},

	LtBooleanRenderTableEdit: {
		renderTableEdit: renderEditRender(Switch),
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},

	LtSelectRenderTableEdit: {
		tableAutoFocus: 'input',
		renderTableEdit: renderEditRender(Select, {
			style: {
				width: '100%',
			},
			allowClear: true,
			showSearch: true,
			filterOption: (input: string, option: any) => {
				const label = option.label?.toString().toLowerCase() || '';
				const value = option.value?.toString().toLowerCase() || '';
				return (
					label.includes(input.toLowerCase()) ||
					value.includes(input.toLowerCase())
				);
			},
		}),
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},

	LtDateRenderTableEdit: {
		tableAutoFocus: 'input',
		renderTableEdit: (renderOpts, params) => (
			<DataPicker renderOpts={renderOpts} params={params}></DataPicker>
		),
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},

	LtTimeRenderTableEdit: {
		tableAutoFocus: 'input',
		renderTableEdit: (renderOpts, params) => (
			<TimePicker renderOpts={renderOpts} params={params}></TimePicker>
		),
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},

	LtEntityRenderTableEdit: {
		tableAutoFocus: 'input',
		renderTableEdit: (renderOpts, params) => {
			const props = renderOpts.props;
			const { row, column, $table } = params;
			let cellValue = get(row, column.field);

			cellValue = formatTableCell({ cellValue, row, column });

			// 举例： column.field = 'entity.name' 那么path = 'name'
			const fieldList = column.field.split('.');
			const path =
				fieldList.length > 1 ? fieldList.slice(1).join('.') : undefined;

			return (
				<EntitySelector
					params={params}
					dataConfig={props.editDataConfig}
					columns={props.editColumns}
					inputValue={cellValue}
					path={path}
					onClear={() => {
						const splitList = column.field.split('.');
						if (splitList.length > 1) {
							set(row, splitList[0], null);
							$table?.updateStatus(params);
						}
					}}
					onRadioChange={(v) => {
						const splitList = column.field.split('.');
						if (splitList.length > 1) {
							set(row, splitList[0], v?.row);
							$table?.updateStatus(params);
						}
					}}
					{...props}
					mode="popover"
				></EntitySelector>
			);
		},
		renderTableCell: renderCellContent,
		renderTableDefault: renderCellContent,
	},
});

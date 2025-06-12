import {
	DatePicker as ADatePicker,
	Input,
	InputNumber,
	Select,
	Switch,
	TimePicker as ATimePicker,
	QRCode,
} from 'ant-design-vue';
import dayjs from 'dayjs';
import { assign, get, isUndefined, set } from 'lodash';
import { computed, defineComponent, PropType } from 'vue';
import { VxeGlobalRendererHandles, VxeUI } from 'vxe-pc-ui';
import { objectEach } from 'xe-utils';
import EntitySelector from '../../entity-selector';
import { formatTableCell } from '../utils';
import BarCode from '../../bar-code';

function getOnName(type: string) {
	return `on${type.substring(0, 1).toLocaleUpperCase()}${type.substring(1)}`;
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

function renderEditRender(Comp: any, defaultProps?: { [prop: string]: any }) {
	return (
		renderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions,
		params: VxeGlobalRendererHandles.RenderFormItemContentParams
	) => {
		const { attrs } = renderOpts;
		const { data, field } = params;

		const cellValue = get(data, field);

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

function getEditOns(
	componentName: string,
	renderOpts: VxeGlobalRendererHandles.RenderFormItemContentOptions,
	params: VxeGlobalRendererHandles.RenderFormItemContentParams
) {
	const { $form, data, field } = params;
	return getOns(
		componentName,
		renderOpts,
		params,
		(value: any) => {
			// 处理 model 值双向绑定
			set(data, field, value);
		},
		() => {
			// 处理 change 事件相关逻辑
			$form?.updateStatus(params);
		}
	);
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
			type: Object as PropType<VxeGlobalRendererHandles.RenderFormItemContentOptions>,
			required: true,
		},
		params: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderFormItemContentParams>,
			required: true,
		},
	},
	setup(props) {
		const { renderOpts, params } = props;
		const { data, field, $form } = params;
		const picker = getPickerType(renderOpts.props?.dateFormatter);
		const showTime = showTimeFormat(renderOpts.props?.dateFormatter);

		const value = computed({
			get: () => {
				const cellValue = get(data, field);
				return cellValue ? dayjs(cellValue) : undefined;
			},
			set: (value) => {
				if (value == null) {
					set(data, field, null);
				} else {
					set(data, field, value.valueOf());
				}
				$form?.updateStatus(params);
			},
		});
		return () => (
			<ADatePicker
				picker={picker}
				showTime={showTime}
				format={renderOpts.props?.dateFormatter}
				v-model:value={value.value}
			></ADatePicker>
		);
	},
});

const TimePicker = defineComponent({
	props: {
		renderOpts: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderFormItemContentOptions>,
			required: true,
		},
		params: {
			type: Object as PropType<VxeGlobalRendererHandles.RenderFormItemContentParams>,
			required: true,
		},
	},
	setup(props) {
		const { renderOpts, params } = props;
		const { data, field, $form } = params;

		const value = computed({
			get: () => {
				const cellValue = get(data, field);
				return cellValue ? dayjs(cellValue) : undefined;
			},
			set: (value) => {
				if (value == null) {
					set(data, field, null);
				} else {
					set(data, field, value.valueOf());
				}
				$form?.updateStatus(params);
			},
		});
		return () => (
			<ATimePicker
				format={renderOpts.props?.timeFormatter}
				v-model:value={value.value}
			></ATimePicker>
		);
	},
});

VxeUI.renderer.mixin({
	// 只读模式
	LtReadOnlyForm: {
		renderFormItemContent: (renderOpts, params) => {
			const props = renderOpts.props;
			const { data, field, item } = params;
			let cellValue = get(data, field);

			cellValue = formatTableCell({
				cellValue,
				row: data,
				column: {
					...item,
					params: {
						formatter: props?.__formatter,
					},
				},
			});

			return <span style="user-select: text;">{cellValue}</span>;
		},
	},
	LtTextRenderCode: {
		renderFormItemContent: (renderOpts, params) => {
			const { props } = renderOpts;

			const { data, field } = params;
			const codeType = props?.codeType || 'qrCode';
			const showValue = isUndefined(props?.showCodeValue)
				? true
				: props?.showCodeValue; // 默认显示值

			const cellValue = get(data, field);

			return codeType === 'qrCode' ? (
				<div style="display: inline-block;">
					<div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
						<QRCode size={props?.codeSize} value={cellValue || 'N/A'} />
						{showValue && (
							<span style="user-select: text">{cellValue || 'N/A'}</span>
						)}
					</div>
				</div>
			) : (
				<div style="display: inline-block;">
					<BarCode
						options={{
							fontSize: 14,
							width: 1.5,
							height: props?.codeSize,
							displayValue: showValue,
						}}
						value={cellValue || 'N/A'}
					/>
				</div>
			);
		},
	},
	LtTextRenderFormEdit: {
		renderFormItemContent: (renderOpts, params) => {
			const { props } = renderOpts;
			const isTextarea = props?.isTextarea;

			if (isTextarea) {
				return renderEditRender(Input.TextArea, {
					style: {
						width: '100%',
					},
				})(renderOpts, params);
			}

			return renderEditRender(Input, {
				style: {
					width: '100%',
				},
				allowClear: true,
			})(renderOpts, params);
		},
	},
	LtNumberRenderFormEdit: {
		renderFormItemContent: renderEditRender(InputNumber, {
			style: {
				width: '100%',
			},
			allowClear: true,
		}),
	},
	LtBooleanRenderFormEdit: {
		renderFormItemContent: renderEditRender(Switch),
	},
	LtSelectRenderFormEdit: {
		renderFormItemContent: renderEditRender(Select, {
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
	},
	LtDateRenderFormEdit: {
		renderFormItemContent: (renderOpts, params) => (
			<DataPicker renderOpts={renderOpts} params={params}></DataPicker>
		),
	},
	LtTimeRenderFormEdit: {
		renderFormItemContent: (renderOpts, params) => (
			<TimePicker renderOpts={renderOpts} params={params}></TimePicker>
		),
	},
	LtEntityRenderFormEdit: {
		renderFormItemContent: (renderOpts, params) => {
			const props = renderOpts.props;
			const { data, field, $form, item } = params;

			let cellValue = get(data, field);

			cellValue = formatTableCell({
				cellValue,
				row: data,
				column: {
					...item,
					params: {
						formatter: props?.__formatter,
					},
				},
			});

			// 举例： column.field = 'entity.name' 那么path = 'name'
			const fieldList = field.split('.');
			const path =
				fieldList.length > 1 ? fieldList.slice(1).join('.') : undefined;

			return (
				<EntitySelector
					params={params}
					dataConfig={props?.editDataConfig}
					columns={props?.editColumns}
					inputValue={cellValue}
					path={path}
					onClear={() => {
						const splitList = field.split('.');
						if (splitList.length > 1) {
							set(data, splitList[0], null);
							$form?.updateStatus(params);
						}
					}}
					onRadioChange={(v) => {
						const splitList = field.split('.');
						if (splitList.length > 1) {
							set(data, splitList[0], v?.row);
							$form?.updateStatus(params);
						}
					}}
					{...props}
					mode="popover"
				></EntitySelector>
			);
		},
	},
});

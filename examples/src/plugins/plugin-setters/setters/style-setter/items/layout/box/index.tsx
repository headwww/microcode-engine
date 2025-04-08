import { defineComponent, PropType, watch } from 'vue';
import { InputNumber } from 'ant-design-vue';
import './index.scss';
import { isNaN, parseInt } from 'lodash-es';
import { StyleData } from '../../../types';
import { addUnit, removeUnit } from '../../../utils';
import { layoutConfig } from '../locale';
import { UnitInput } from '../../../components';

export default defineComponent({
	name: 'Box',
	props: {
		styleData: {
			type: Object as PropType<StyleData | any>,
			default: () => ({}),
		},
		onStyleChange: {
			type: Function as PropType<(style: StyleData[]) => void>,
			default: () => {},
		},
		unit: {
			type: String as PropType<string>,
		},
	},
	setup(props) {
		watch(
			() => props.styleData,
			(newVal) => {
				console.log(newVal);
			}
		);
		const onInputChange = (styleKey: string, value: string) => {
			const { onStyleChange, unit = 'px' } = props;
			if (value !== '') {
				// 判断是否是数字
				if (!isNaN(parseInt(value))) {
					onStyleChange([
						{
							styleKey,
							value: addUnit(value, unit) as any,
						},
					]);
				}
			}
			if (value === '' || value === null || value === undefined) {
				onStyleChange([
					{
						styleKey,
						value: null,
					},
				]);
			}
		};

		const KEY_ARROW_DOWN = 'ArrowDown';
		const KEY_ARROW_UP = 'ArrowUp';

		const onInputKeyDown = (key: string, styleKey: string) => {
			const { onStyleChange, unit = 'px', styleData } = props;
			const value = styleData[styleKey] || 0;
			if (key === KEY_ARROW_DOWN) {
				onStyleChange([
					{
						styleKey,
						value: addUnit(parseInt(value) - 1, unit) as any,
					},
				]);
			} else if (key === KEY_ARROW_UP) {
				onStyleChange([
					{
						styleKey,
						value: addUnit(parseInt(value) + 1, unit) as any,
					},
				]);
			}
		};

		return () => (
			<div class="box-container">
				<div class="margin-top-div">
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.marginTop)}
						onUpdate:value={(value: any) => {
							onInputChange('marginTop', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'marginTop')}
					/>
				</div>
				<div class="margin-right-div">
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.marginRight)}
						onUpdate:value={(value: any) => {
							onInputChange('marginRight', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'marginRight')}
					/>
				</div>
				<div class="margin-bottom-div">
					<span class="help-txt">{layoutConfig.margin}</span>
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.marginBottom)}
						onUpdate:value={(value: any) => {
							onInputChange('marginBottom', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'marginBottom')}
					/>
				</div>
				<div class="margin-left-div">
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.marginLeft)}
						onUpdate:value={(value: any) => {
							onInputChange('marginLeft', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'marginLeft')}
					/>
				</div>

				<div class="padding-top-div">
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.paddingTop)}
						onUpdate:value={(value: any) => {
							onInputChange('paddingTop', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'paddingTop')}
					/>
				</div>
				<div class="padding-right-div">
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.paddingRight)}
						onUpdate:value={(value: any) => {
							onInputChange('paddingRight', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'paddingRight')}
					/>
				</div>
				<div class="padding-bottom-div">
					<span class="help-txt">{layoutConfig.padding}</span>
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.paddingBottom)}
						onUpdate:value={(value: any) => {
							onInputChange('paddingBottom', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'paddingBottom')}
					/>
				</div>
				<div class="padding-left-div">
					<InputNumber
						controls={false}
						bordered={false}
						placeholder="0"
						value={removeUnit(props.styleData.paddingLeft)}
						onUpdate:value={(value: any) => {
							onInputChange('paddingLeft', value);
						}}
						onKeyDown={(e: any) => onInputKeyDown(e.key, 'paddingLeft')}
					/>
				</div>

				<div class="center-box">
					<div class="dimension-inputs">
						<div class="width-input">
							<span class="dimension-label">W</span>
							<UnitInput
								styleKey="width"
								min={0}
								size="small"
								placeholder={layoutConfig.width}
								styleData={props.styleData}
								onStyleChange={props.onStyleChange}
							></UnitInput>
						</div>
						<div class="height-input">
							<span class="dimension-label">H</span>
							<UnitInput
								styleKey="height"
								min={0}
								placeholder={layoutConfig.height}
								styleData={props.styleData}
								onStyleChange={props.onStyleChange}
							></UnitInput>
						</div>
					</div>
				</div>
			</div>
		);
	},
});

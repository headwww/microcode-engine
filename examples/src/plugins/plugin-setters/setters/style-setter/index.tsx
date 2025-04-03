import { computed, defineComponent, PropType, ref } from 'vue';
import { Collapse } from 'ant-design-vue';
import { omit } from 'lodash-es';
import { Background, Font, Layout, Position } from './items';
import { StyleData } from './types';
import './index.scss';

// TODO 先不实现
export const StyleSetter = defineComponent({
	name: 'StyleSetter',
	inheritAttrs: false,
	props: {
		styleData: {
			type: Object as PropType<StyleData>,
			default: () => ({}),
		},
		showModuleList: {
			type: Array as PropType<string[]>,
			default: () => ['background', 'border', 'font', 'layout', 'position'],
		},
		onChange: {
			type: Function as PropType<(val: any) => void>,
		},
		unit: {
			type: String as PropType<string>,
			default: 'px',
		},
		value: null,
	},
	setup(props) {
		const styleData = computed({
			get: () => props.value,
			set: (val) => {
				props.onChange?.(val);
			},
		});

		const activeKey = ref(['layout', 'font', 'background', 'position']);

		const onStyleChange = (styleDataList: StyleData[]) => {
			const newStyleData = { ...styleData.value };

			styleDataList?.forEach((item) => {
				if (item.value === undefined || item.value == null) {
					delete newStyleData[item.styleKey];
				} else {
					newStyleData[item.styleKey] = item.value;
				}
			});

			styleData.value = newStyleData;
		};

		return () => {
			const { showModuleList } = props;

			return (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
					<Collapse
						v-model:activeKey={activeKey.value}
						class="mtc-setter-collapse"
						bordered={false}
						style={{ backgroundColor: 'transparent' }}
					>
						{showModuleList.filter((item) => item === 'layout').length > 0 && (
							<Collapse.Panel
								headerClass="collapse-panel-header"
								header="布局"
								key="layout"
							>
								<Layout
									{...omit(props, 'onChange')}
									styleData={styleData.value}
									onStyleChange={onStyleChange}
								/>
							</Collapse.Panel>
						)}
						{showModuleList.filter((item) => item === 'font').length > 0 && (
							<Collapse.Panel
								headerClass="collapse-panel-header"
								header="字体"
								key="font"
							>
								<Font
									{...omit(props, 'onChange')}
									styleData={styleData.value}
									onStyleChange={onStyleChange}
								/>
							</Collapse.Panel>
						)}
						{showModuleList.filter((item) => item === 'background').length >
							0 && (
							<Collapse.Panel
								headerClass="collapse-panel-header"
								header="背景"
								key="background"
							>
								<Background
									{...omit(props, 'onChange')}
									styleData={styleData.value}
									onStyleChange={onStyleChange}
								/>
							</Collapse.Panel>
						)}
						{showModuleList.filter((item) => item === 'position').length >
							0 && (
							<Collapse.Panel
								headerClass="collapse-panel-header"
								header="位置"
								key="position"
							>
								<Position
									{...omit(props, 'onChange')}
									styleData={styleData.value}
									onStyleChange={onStyleChange}
								/>
							</Collapse.Panel>
						)}
					</Collapse>
				</div>
			);
		};
	},
});

import { defineComponent, onMounted, ref } from 'vue';
import { Select } from 'ant-design-vue';
import { project } from '@arvin-shu/microcode-engine';

interface DataSourceItem {
	value: string;
	label: string;
}

interface DataSourceItem {
	value: string;
	label: string;
}

export const ClassSetter = defineComponent({
	name: 'ClassSetter',

	props: {
		value: {
			type: String,
			default: '',
		},
	},
	emits: ['change'], // 声明要触发的事件

	setup(props, { emit }) {
		const dataSource = ref<DataSourceItem[]>([]);
		const selectValue = ref<string[]>([]);

		const getClassNameList = () => {
			const schema = project.exportSchema();
			const css = schema.componentsTree[0].css;
			const classNameList: string[] = [];

			if (css) {
				const re = /\.?\w+[^{]+\{[^}]*\}/g;
				const list = css.match(re);
				list?.forEach((item) => {
					if (item[0] === '.') {
						let className = item.substring(1, item.indexOf('{'));
						if (className.indexOf(':') >= 0) {
							className = item.substring(1, item.indexOf(':'));
						}
						// 移除左右两边空格
						className = className.replace(/^\s*|\s*$/g, '');
						classNameList.push(className);
					}
				});
			}

			return classNameList;
		};

		const handleChange = (value: string[]) => {
			const newValue = value.join(' ');
			emit('change', newValue); // 触发 change 事件
			selectValue.value = value;
		};

		onMounted(() => {
			const classnameList = getClassNameList();
			const newDataSource: DataSourceItem[] = classnameList.map((item) => ({
				value: item,
				label: item,
			}));

			// 处理初始值
			let initialSelectValue: string[] = [];
			if (props.value && props.value !== '') {
				initialSelectValue = props.value.split(' ');
			}

			// 添加不在现有类名列表中的值
			initialSelectValue.forEach((current) => {
				if (!classnameList.some((cls) => cls === current)) {
					newDataSource.push({
						value: current,
						label: current,
					});
				}
			});

			dataSource.value = newDataSource;
			selectValue.value = initialSelectValue;
		});

		return () => (
			<Select
				value={selectValue.value}
				mode="tags"
				style={{ width: '100%' }}
				options={dataSource.value}
				onUpdate:value={(value: any) => {
					handleChange(value);
				}}
			/>
		);
	},
});

import { computed, defineComponent, onMounted, PropType, ref } from 'vue';
import './index.scss';
import { Input } from 'ant-design-vue';
import { intl } from '@arvin-shu/microcode-editor-core';
import {
	IPublicApiCanvas,
	IPublicApiMaterial,
} from '@arvin-shu/microcode-types';
import { intl as intlLocale } from '../locale';
import { ArrowIcon, SearchIcon } from '../icons';

export default defineComponent({
	props: {
		canvas: {
			type: Object as PropType<IPublicApiCanvas>,
			required: true,
		},
		material: {
			type: Object as PropType<IPublicApiMaterial>,
			required: true,
		},
	},
	setup(props) {
		const searchText = ref('');

		// 获取组件列表
		const components = computed(() => {
			const rawData = props.material.getAssets();
			const rawComponents = rawData?.components || [];
			return [...rawComponents];
		});

		// 获取组件分组
		const groups = computed(() => {
			const groups = new Set<any>();
			let hasOtherGroup = false;
			components.value.forEach((item) => {
				if (item.group) {
					groups.add(item.group);
				} else {
					hasOtherGroup = true;
				}
			});
			if (hasOtherGroup) {
				groups.add('其他组件');
			}
			return Array.from(groups);
		});

		// 当前选中的分组
		const currentGroup = ref();

		// 搜索过滤
		const filteredComponents = () =>
			components.value
				.filter((item) => {
					if (currentGroup.value === '其他组件') {
						return !item.group;
					}
					return item.group === currentGroup.value;
				})
				.filter((item) => {
					const include1 = item.componentName
						?.toLowerCase()
						.includes(searchText.value.toLowerCase());

					const include2 = item.snippets?.[0].title
						?.toLowerCase()
						.includes(searchText.value.toLowerCase());

					return include1 || include2;
				});

		// 按分类分组
		const groupedComponents = computed(() =>
			filteredComponents().reduce(
				(acc, curr) => {
					const category: string = (intl(curr.category!) as string) || '其他';
					if (!acc[category]) {
						acc[category] = [];
					}
					acc[category].push(curr);
					return acc;
				},
				{} as Record<string, any[]>
			)
		);

		const expandedCategories = ref<Set<string>>(new Set());
		// 切换分类展开状态
		const toggleCategory = (category: string) => {
			const newExpanded = new Set(expandedCategories.value);
			if (newExpanded.has(category)) {
				newExpanded.delete(category);
			} else {
				newExpanded.add(category);
			}
			expandedCategories.value = newExpanded;
		};

		onMounted(() => {
			if (groups.value.length > 0) {
				currentGroup.value = groups.value[0];
			}

			// 使用 components 中的所有唯一分类初始化展开状态
			const categories = new Set(
				components.value
					.map((item) => (intl(item.category!) as string) || '其他')
					.filter(Boolean)
			);
			expandedCategories.value = categories;
		});
		return () => (
			<div class="mtc-components-pane">
				{/* 顶部分组切换 */}
				<div class="mtc-group-tabs">
					{groups.value.map((group) => (
						<div
							key={group}
							class={[
								'mtc-group-tab',
								currentGroup.value === group ? 'active' : '',
							]}
							onClick={() => {
								currentGroup.value = group;
							}}
						>
							{group}
						</div>
					))}
				</div>
				{/* 搜索框 */}
				<div class="mtc-search-box">
					<Input
						v-model:value={searchText.value}
						placeholder={intlLocale('Search Components')}
						allowClear
						suffix={<SearchIcon class="mtc-search-icon" />}
					/>
				</div>

				<div class="mtc-components-container">
					{Object.entries(groupedComponents.value).map(([category, items]) => (
						<div class="category-section" key={category}>
							<div
								class="category-header"
								onClick={() => {
									toggleCategory(category);
								}}
							>
								<span class="category-title">{category}</span>

								{expandedCategories.value.has(category) ? (
									<ArrowIcon class="expand-icon" />
								) : (
									<ArrowIcon
										class="expand-icon"
										style={{ transform: 'rotate(-90deg)' }}
									/>
								)}
							</div>
							<div
								class={[
									'category-content',
									expandedCategories.value.has(category) ? 'expanded' : '',
								]}
							>
								<div class="category-items">
									{items.map((item, index) => (
										<div
											class="component-item"
											key={index}
											ref={(el: any) => {
												if (el) {
													props.canvas?.dragon?.from(
														el,
														() =>
															({
																type: 'nodedata',
																data:
																	item.snippets.length > 0
																		? item.snippets[0].schema
																		: {},
															}) as any
													);
												}
											}}
											data-id={
												item.snippets.length > 0
													? item.snippets[0].schema.componentName
													: ''
											}
										>
											<span class="anticon">{item.icon}</span>
											<span class="text"> {item.snippets[0].title}</span>
										</div>
									))}
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	},
});

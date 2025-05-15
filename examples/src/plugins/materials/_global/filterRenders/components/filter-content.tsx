import { InputSearch, Tree, TreeProps } from 'ant-design-vue';
import { computed, defineComponent, PropType, ref } from 'vue';
import { ContentFilterData } from '../types';

export default defineComponent({
	name: 'LtFilterContent',
	emits: ['update:value'],
	props: {
		options: {
			type: Array as PropType<TreeProps['treeData']>,
			default: () => [],
		},
		value: {
			type: Object as PropType<ContentFilterData>,
			default: () => ({
				checkedKeys: [],
			}),
		},
	},
	setup(props, { emit }) {
		const searchValue = ref('');

		const value = computed({
			get() {
				return props.value.checkedKeys;
			},
			set(value: string[]) {
				emit('update:value', { checkedKeys: value });
			},
		});

		// 过滤和高亮处理树形数据
		const filteredTreeData = computed(() => {
			if (!searchValue.value) {
				return props.options;
			}

			const searchLower = searchValue.value.toLowerCase();

			const highlightTitle = (title: string) => {
				const index = title.toLowerCase().indexOf(searchLower);
				if (index === -1) return title;

				const beforeStr = title.substring(0, index);
				const matchStr = title.substring(
					index,
					index + searchValue.value.length
				);
				const afterStr = title.substring(index + searchValue.value.length);

				return (
					<span>
						{beforeStr}
						<span style={{ color: '#f50' }}>{matchStr}</span>
						{afterStr}
					</span>
				);
			};

			const filterNode = (node: any): any => {
				const title = node.title?.toString() || '';
				const isMatch = title.toLowerCase().includes(searchLower);

				if (node.children) {
					const filteredChildren = node.children
						.map(filterNode)
						.filter(Boolean);

					if (filteredChildren.length > 0 || isMatch) {
						return {
							...node,
							title: highlightTitle(title),
							children: filteredChildren,
						};
					}
					return null;
				}

				return isMatch ? { ...node, title: highlightTitle(title) } : null;
			};

			return props.options?.map(filterNode).filter(Boolean);
		});

		return () => (
			<div class="lt-filter-content">
				<InputSearch
					placeholder="搜索"
					allowClear
					v-model:value={searchValue.value}
				/>
				<div class="lt-filter-content-tree">
					<Tree
						checkable
						v-model:checkedKeys={value.value}
						treeData={filteredTreeData.value}
						height={200}
						autoExpandParent={true}
						defaultExpandAll={!!searchValue.value || true}
					/>
				</div>
			</div>
		);
	},
});

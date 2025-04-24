import { defineComponent, PropType } from 'vue';
import { Button, Dropdown, Menu } from 'ant-design-vue';

export default defineComponent({
	name: 'Actions',
	props: {
		actions: Array as PropType<
			Array<{
				// 按钮名称
				title: string;
				// 按钮点击事件
				onAction?: (params: any) => void;
				// 是否可触发回调函数
				onDisabled?: (params: any) => boolean;
			}>
		>,
		buttonType: {
			type: String as PropType<'default' | 'link'>,
			default: 'default',
		},
		maxShowCount: {
			type: Number,
			default: 3,
		},
		params: Object as PropType<any>,
	},
	setup(props) {
		const renderButtons = () => {
			if (!props.actions?.length) return null;

			// 如果actions数量小于等于maxShowCount，直接显示所有按钮
			if (props.actions.length <= props.maxShowCount) {
				return props.actions.map((action, index) => (
					<Button
						key={index}
						size="small"
						type={props.buttonType}
						onClick={() => action.onAction?.(props.params)}
						disabled={action.onDisabled?.(props.params)}
					>
						{action.title}
					</Button>
				));
			}

			// 如果超过maxShowCount，显示前(maxShowCount-1)个按钮和一个下拉菜单
			const visibleButtons = props.actions.slice(0, props.maxShowCount - 1);
			const dropdownItems = props.actions.slice(props.maxShowCount - 1);

			return (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					{visibleButtons.map((action, index) => (
						<Button
							key={index}
							size="small"
							type={props.buttonType}
							onClick={() => action.onAction?.(props.params)}
							disabled={action.onDisabled?.(props.params)}
						>
							{action.title}
						</Button>
					))}
					<Dropdown
						size="small"
						v-slots={{
							overlay: () => (
								<Menu>
									{dropdownItems.map((action, index) => (
										<Menu.Item
											key={index}
											disabled={action.onDisabled?.(props.params)}
											onClick={() => action.onAction?.(props.params)}
										>
											{action.title}
										</Menu.Item>
									))}
								</Menu>
							),
						}}
					>
						<Button size="small" type={props.buttonType}>
							...
						</Button>
					</Dropdown>
				</div>
			);
		};

		return () => <div class="action-buttons">{renderButtons()}</div>;
	},
});

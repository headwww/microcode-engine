import { Button, Popover } from 'ant-design-vue';
import { defineComponent } from 'vue';

export const PopupService = defineComponent({
	name: 'PopupService',
	setup(props, { slots }) {
		return () => {
			const children = slots.default ? slots.default() : <></>;

			return (
				<>
					{children}
					<PopupContent></PopupContent>
				</>
			);
		};
	},
});

export const PopupContent = defineComponent({
	name: 'PopupContent',
	setup() {
		return () => (
			<Popover
				placement="left"
				trigger="click"
				content={<div class="mtc-popup-placeholder">123dsdsds</div>}
			>
				<Button>123232</Button>
			</Popover>
		);
	},
});

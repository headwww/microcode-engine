import { defineComponent } from 'vue';

export const FlexDirectionRowIcon = defineComponent({
	name: 'FlexDirectionRowIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 16 16"
			>
				<path
					d="M5 2L5 14L0 14L0 2L5 2ZM10 2L10 14L6 14L6 2L10 2ZM13 4L16 8L13 12L12.9995 9L11 9L11 7L13 7L13 4Z"
					fill="currentColor"
				></path>
			</svg>
		);
	},
});

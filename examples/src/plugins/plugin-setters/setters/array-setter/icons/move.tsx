import { defineComponent } from 'vue';

export const MoveIcon = defineComponent({
	name: 'MoveIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="#000"
				style="vertical-align: middle;opacity: 0.7;"
			>
				<path d="M6.75 2.25h3v3h-3zm7.5 0h3v3h-3zm-7.5 5.5h3v3h-3zm7.5 0h3v3h-3zm-7.5 5.5h3v3h-3zm7.5 0h3v3h-3zm-7.5 5.5h3v3h-3zm7.5 0h3v3h-3z" />
			</svg>
		);
	},
});

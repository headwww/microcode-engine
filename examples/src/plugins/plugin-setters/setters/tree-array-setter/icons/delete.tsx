import { defineComponent } from 'vue';

export const DeleteIcon = defineComponent({
	name: 'DeleteIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				style="vertical-align: middle;opacity: 0.7;"
			>
				<path d="M20 7v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7H2V5h20v2zM6 7v13h12V7zm1-5h10v2H7zm4 8h2v7h-2z" />
			</svg>
		);
	},
});

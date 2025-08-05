import { defineComponent } from 'vue';

export const YesIcon = defineComponent({
	name: 'YesIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 12 12"
				fill="currentColor"
				style=" vertical-align: middle;"
			>
				<path d="M9.765 3.205a.75.75 0 0 1 .03 1.06l-4.25 4.5a.75.75 0 0 1-1.075.015L2.22 6.53a.75.75 0 0 1 1.06-1.06l1.705 1.704l3.72-3.939a.75.75 0 0 1 1.06-.03" />
			</svg>
		);
	},
});

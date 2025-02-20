import { defineComponent } from 'vue';

export const ConvertIcon = defineComponent({
	name: 'ConvertIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="currentColor"
			>
				<path d="M12.005 22.003c-5.523 0-10-4.477-10-10s4.477-10 10-10s10 4.477 10 10s-4.477 10-10 10m0-2a8 8 0 1 0 0-16a8 8 0 0 0 0 16m-5-11l3-3.5l3 3.5h-2v4h-2v-4zm10 6l-3 3.5l-3-3.5h2v-4h2v4z" />
			</svg>
		);
	},
});

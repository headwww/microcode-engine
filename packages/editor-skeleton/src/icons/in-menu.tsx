import { defineComponent } from 'vue';

export const InMenuIcon = defineComponent({
	name: 'InMenuIcon',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="24"
				height="24"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M3 18h13v-2H3zm0-5h10v-2H3zm0-7v2h13V6zm18 9.59L17.42 12L21 8.41L19.59 7l-5 5l5 5z"
				/>
			</svg>
		);
	},
});

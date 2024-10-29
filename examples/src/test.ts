import { computed, ref } from 'vue';

export class Test {
	a = ref(true);

	b = computed(() => {
		console.log('=====');

		return this.a.value;
	});
}

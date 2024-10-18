import { Ref, ref } from 'vue';

export class A {
	a: Ref = ref(1);

	add() {
		this.a.value++;
	}
}

export const a = new A();

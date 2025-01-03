import { computed, ref, toRaw } from 'vue';

export class ReactTest {
	private _id = ref(false);

	get id() {
		return this._id.value;
	}

	set id(value: boolean) {
		this._id.value = value;
	}
}

export class ReactTest2 {
	reactTest = ref<ReactTest | null>(null);

	constructor(reactTest: ReactTest) {
		this.reactTest.value = reactTest;
	}

	getId() {
		console.log(toRaw(this.reactTest.value));

		return toRaw(this.reactTest.value)?.id;
	}
}

export function useReactTest() {
	const id = ref(false);

	return {
		id,
		setId: (value: boolean) => {
			id.value = value;
		},
		getId: () => id.value,
	};
}

export function useReactTest2(reactTest: ReturnType<typeof useReactTest>) {
	return {
		getId: () => reactTest.id,
	};
}

export class ReactTest3 {
	add = ref(1);

	constructor() {
		document.addEventListener('click', () => {
			console.log('click');
			// eslint-disable-next-line operator-assignment
			this.add.value = this.add.value + 1;
		});
	}
}

export class ReactTest4 {
	reactTest3: ReactTest3;

	hegus = computed(() => this.reactTest3.add.value);

	constructor(reactTest3: ReactTest3) {
		console.log('-----');

		this.reactTest3 = reactTest3;
	}
}

import { ref, toRaw } from 'vue';

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

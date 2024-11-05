type FilterOptional<T> = Pick<
	T,
	Exclude<
		{
			[K in keyof T]: T extends Record<K, T[K]> ? K : never;
		}[keyof T],
		undefined
	>
>;

type FilterNotOptional<T> = Pick<
	T,
	Exclude<
		{
			[K in keyof T]: T extends Record<K, T[K]> ? never : K;
		}[keyof T],
		undefined
	>
>;

type PartialEither<T, K extends keyof any> = {
	[P in Exclude<keyof FilterOptional<T>, K>]-?: T[P];
} & { [P in Exclude<keyof FilterNotOptional<T>, K>]?: T[P] } & {
	[P in Extract<keyof T, K>]?: undefined;
};

type ObjectWithKeys = {
	[name: string]: any;
};

export type EitherOr<
	O extends ObjectWithKeys,
	L extends keyof O,
	R extends keyof O,
> = (PartialEither<Pick<O, L | R>, L> | PartialEither<Pick<O, L | R>, R>) &
	Omit<O, L | R>;

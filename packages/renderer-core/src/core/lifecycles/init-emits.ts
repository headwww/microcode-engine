import { isArray, isObject, RuntimeScope, SchemaParser } from '../../utils';

export function initEmits(
	parser: SchemaParser,
	schema: unknown,
	scope: RuntimeScope
) {
	const emitsOptions = parser.parseSchema(schema, false);

	const dataResult = isArray(emitsOptions)
		? // eslint-disable-next-line no-return-assign, no-sequences
			emitsOptions.reduce((res, next) => ((res[next] = null), res), {})
		: isObject(emitsOptions)
			? emitsOptions
			: null;

	if (!dataResult || Object.keys(dataResult).length === 0) return;

	scope.$.emitsOptions = Object.create(
		scope.$.emitsOptions,
		Object.getOwnPropertyDescriptors(dataResult)
	);
}

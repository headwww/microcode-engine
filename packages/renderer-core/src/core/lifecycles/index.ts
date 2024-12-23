import { IPublicTypeContainerSchema } from '@arvin-shu/microcode-types';
import { initEmits } from './init-emits';
import { RuntimeScope, SchemaParser } from '../../utils';
import { beforeCreate } from './beforeCreate';
import { initProps } from './init-props';
import { setup } from './setup';

const VUE_MICROCODE_LIFTCYCLES_MAP = {
	setup,
	initEmits,
	beforeCreate,
	initProps,
};

export type MicrocodeHookMap = typeof VUE_MICROCODE_LIFTCYCLES_MAP;
export type MicrocodeHook = keyof MicrocodeHookMap;

export function createHookCaller(
	schema: IPublicTypeContainerSchema,
	scope: RuntimeScope,
	parser: SchemaParser
) {
	function callHook(
		hook: 'setup',
		props: object,
		ctx: object
	): void | Promise<void>;
	function callHook<T extends Exclude<MicrocodeHook, 'setup'>>(hook: T): void;
	function callHook<T extends MicrocodeHook>(
		hook: T,
		param1?: object,
		param2?: object
	): void | Promise<void> {
		const lifeCycles = schema.lifeCycles ?? {};
		const lifeCycleSchema = lifeCycles[hook];
		const hookFn = VUE_MICROCODE_LIFTCYCLES_MAP[hook];
		if (lifeCycleSchema && hookFn) {
			return hookFn(parser, lifeCycleSchema, scope, [param1!, param2!]);
		}
	}

	return callHook;
}

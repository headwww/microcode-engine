import {
	InterpretDataSource,
	RequestHandler,
} from '@arvin-shu/microcode-datasource-types';
import { createDataSourceEngine } from '@arvin-shu/microcode-datasource-engine';
import { AccessTypes, addToScope, RuntimeScope } from '../utils';

export function create(
	config: InterpretDataSource,
	scope: RuntimeScope,
	requestHandlerMaps?: Record<string, RequestHandler>
) {
	return createDataSourceEngine(
		config,
		{
			...scope,
			state: scope,
			setState(state) {
				const needAddScope: Record<string, unknown> = {};
				for (const key in state) {
					if (key in scope) {
						scope[key] = state[key];
					} else {
						needAddScope[key] = state[key];
					}
				}
				if (Object.keys(needAddScope).length > 0) {
					addToScope(scope, AccessTypes.CONTEXT, needAddScope);
					scope.$forceUpdate();
				}
			},
			forceUpdate: () => scope.$forceUpdate(),
		},
		{
			requestHandlersMap: requestHandlerMaps as any,
		}
	);
}

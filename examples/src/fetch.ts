// import axios from 'axios';
import * as lodash from 'lodash-es';
import { http } from './utils/http';

// api/orderClassesService/findOrderClassessByPage

export function createAxiosFetchHandler(config?: Record<string, unknown>) {
	// eslint-disable-next-line func-names
	return async function (options: any) {
		config;
		// const requestConfig = {
		// 	url: options.uri,
		// 	method: options.method,
		// 	data: options.params,
		// 	headers: {
		// 		'Content-Type': 'application/json;charset=UTF-8',
		// 		Accept: 'application/json',
		// 	},
		// };

		// const response = await axios(requestConfig as any);

		return http.request({
			url: options.uri,
			method: options.method,
			data: options.params,
		});
	};
}

export const appHelper = {
	requestHandlersMap: {
		fetch: createAxiosFetchHandler(),
	},
	lodash: {
		...lodash,
	},
};

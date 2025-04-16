// import axios from 'axios';
import { http } from './utils/http';

// api/orderClassesService/findOrderClassessByPage

export function createAxiosFetchHandler(config?: Record<string, unknown>) {
	// eslint-disable-next-line func-names
	return async function (options: any) {
		const response = await http.post({
			url: options.uri,
			data: options.params,
		});

		config;
		console.log(response);

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
		return response;
	};
}

export const appHelper = {
	requestHandlersMap: {
		fetch: createAxiosFetchHandler(),
	},
};

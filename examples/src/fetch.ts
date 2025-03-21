import axios from 'axios';

export function createAxiosFetchHandler(config?: Record<string, unknown>) {
	// eslint-disable-next-line func-names
	return async function (options: any) {
		const requestConfig = {
			url: options.uri,
			method: options.method,
			data: options.params,
			headers: {
				'Content-Type': 'application/json;charset=UTF-8',
				Accept: 'application/json',
			},
		};

		config;
		const response = await axios(requestConfig as any);
		return response;
	};
}

export const appHelper = {
	requestHandlersMap: {
		fetch: createAxiosFetchHandler(),
	},
};

/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-04-17 18:39:54
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-06-13 12:30:16
 * @FilePath: /microcode-engine/examples/src/fetch.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import axios from 'axios';
import * as lodash from 'lodash-es';
import { message, Modal, notification } from 'ant-design-vue';
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

		if (options.params) {
			options.params = JSON.parse(
				JSON.stringify(options.params).replace('__self', 'this')
			);
		}

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
	feedback: {
		notification,
		Modal,
		message,
	},
};

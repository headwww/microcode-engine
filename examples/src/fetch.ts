/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-04-17 18:39:54
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-06-26 09:53:24
 * @FilePath: /microcode-engine/examples/src/fetch.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// import axios from 'axios';
import * as lodash from 'lodash-es';
import { message, Modal, notification } from 'ant-design-vue';
import { http } from './utils/http';
import { serialize } from './utils/http/fastjson';

// api/orderClassesService/findOrderClassessByPage

export function createAxiosFetchHandler() {
	// eslint-disable-next-line func-names
	return async function (options: any) {
		if (options.params) {
			options.params = JSON.parse(
				JSON.stringify(options.params).replace('__self', 'this')
			);
		}

		if (options.serialize) {
			options.params = serialize(options.params);
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

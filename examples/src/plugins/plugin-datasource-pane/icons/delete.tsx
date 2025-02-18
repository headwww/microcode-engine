/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-02-17 17:12:49
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-02-17 17:19:03
 * @FilePath: /microcode-engine/examples/src/plugins/plugin-datasource-pane/icon/delete.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineComponent } from 'vue';

export const DeleteIcon = defineComponent({
	name: 'Delete',
	setup() {
		return () => (
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="currentColor"
				style="cursor: pointer; vertical-align: middle;"
			>
				<path d="M20 7v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7H2V5h20v2zM6 7v13h12V7zm1-5h10v2H7zm4 8h2v7h-2z" />
			</svg>
		);
	},
});

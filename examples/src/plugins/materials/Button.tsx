/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-01-17 15:46:54
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-01-20 10:43:17
 * @FilePath: /microcode-engine/examples/src/plugins/materials/Button.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { Button } from 'ant-design-vue';
import { ElButton, ElInput } from 'element-plus';
import { defineComponent } from 'vue';

export const TestButton = defineComponent({
	name: 'TestButton',
	props: {
		title: {
			type: String,
			default: '组合控件',
		},
	},
	setup(props) {
		return () => (
			<div>
				<Button>AntV 按钮</Button>
				<ElInput></ElInput>
				<ElButton type="primary">{props.title}</ElButton>
			</div>
		);
	},
});

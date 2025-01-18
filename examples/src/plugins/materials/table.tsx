/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-01-18 13:42:18
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-01-18 13:50:30
 * @FilePath: /microcode-engine/examples/src/plugins/materials/table.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineComponent, ref } from 'vue';
import { VxeTable, VxeColumn } from 'vxe-table';

interface RowVO {
	id: number;
	name: string;
	role: string;
	sex: string;
	age: number;
	address: string;
}

export const TestTable = defineComponent({
	name: 'MyTable',
	props: {
		title: String,
	},
	setup() {
		const tableData = ref<RowVO[]>([
			{
				id: 10001,
				name: 'Test1',
				role: 'Develop',
				sex: 'Man',
				age: 28,
				address: 'test abc',
			},
			{
				id: 10002,
				name: 'Test2',
				role: 'Test',
				sex: 'Women',
				age: 22,
				address: 'Guangzhou',
			},
			{
				id: 10003,
				name: 'Test3',
				role: 'PM',
				sex: 'Man',
				age: 32,
				address: 'Shanghai',
			},
			{
				id: 10004,
				name: 'Test4',
				role: 'Designer',
				sex: 'Women',
				age: 24,
				address: 'Shanghai',
			},
		]);

		return { tableData };
	},
	render() {
		return (
			<div>
				{this.title}
				<VxeTable data={this.tableData}>
					<VxeColumn type="seq" width="70"></VxeColumn>
					<VxeColumn field="name" title="Name"></VxeColumn>
					<VxeColumn field="sex" title="Sex"></VxeColumn>
					<VxeColumn field="age" title="Age"></VxeColumn>
				</VxeTable>
			</div>
		);
	},
});
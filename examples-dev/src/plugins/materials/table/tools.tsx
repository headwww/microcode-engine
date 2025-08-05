import {
	DownloadOutlined,
	EllipsisOutlined,
	FileOutlined,
	FullscreenExitOutlined,
	FullscreenOutlined,
	PrinterOutlined,
	ReloadOutlined,
	RollbackOutlined,
	SearchOutlined,
	TableOutlined,
	UploadOutlined,
} from '@ant-design/icons-vue';
import { Button, Divider, Dropdown, Menu, Tooltip } from 'ant-design-vue';
import { Ref } from 'vue';
import { VxeGridInstance } from 'vxe-table';
import { TableProps } from './types';

export const useTableTools = (
	tableInstance: Ref<(VxeGridInstance & HTMLDivElement) | undefined>,
	props: TableProps,
	params: Ref<any>
) => {
	const renderTools = () => (
		<div>
			<Button
				type="text"
				style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
				icon={<SearchOutlined />}
			>
				搜索
			</Button>
			<Button
				type="text"
				style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
				icon={<ReloadOutlined />}
				onClick={() => {
					props.onRefresh?.(params.value);
				}}
			>
				刷新
			</Button>
			<Dropdown>
				{{
					default: () => (
						<Button
							type="text"
							style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
							icon={<EllipsisOutlined />}
						>
							更多
						</Button>
					),
					overlay: () => (
						<Menu>
							<Menu.Item icon={<DownloadOutlined />} onClick={() => {}}>
								导入
							</Menu.Item>
							<Menu.Item icon={<UploadOutlined />} onClick={() => {}}>
								导出
							</Menu.Item>
							<Menu.Item icon={<FileOutlined />} onClick={() => {}}>
								附件
							</Menu.Item>
							<Menu.Item icon={<PrinterOutlined />} onClick={() => {}}>
								打印
							</Menu.Item>
						</Menu>
					),
				}}
			</Dropdown>
			<Divider type="vertical" />
			<Tooltip title="列设置">
				<Button
					icon={<TableOutlined />}
					style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
					type="text"
					onClick={() => {
						tableInstance.value?.openCustom();
					}}
				></Button>
			</Tooltip>
			<Tooltip title="撤销">
				<Button
					icon={<RollbackOutlined />}
					style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
					type="text"
					onClick={() => {
						tableInstance.value?.revertData();
					}}
				></Button>
			</Tooltip>

			<Tooltip title={tableInstance.value?.isMaximized() ? '还原' : '全屏'}>
				<Button
					type="text"
					icon={
						tableInstance.value?.isMaximized() ? (
							<FullscreenExitOutlined />
						) : (
							<FullscreenOutlined />
						)
					}
					style={{ opacity: 0.6, fontWeight: 600, padding: '4px 6px' }}
					onClick={() => {
						tableInstance.value?.zoom();
					}}
				></Button>
			</Tooltip>
		</div>
	);

	return {
		renderTools,
	};
};

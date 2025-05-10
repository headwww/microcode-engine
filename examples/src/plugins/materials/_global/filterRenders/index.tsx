import { VxeUI } from 'vxe-pc-ui';
import { AdvancedFilter } from './advanced-filter';

VxeUI.renderer.mixin({
	LtFilterRender: {
		showTableFilterFooter: false,
		renderTableFilter({ props = {}, attrs = {}, events = {} }, params) {
			return (
				<AdvancedFilter
					key={params.column.field}
					{...props}
					{...attrs}
					{...events}
					params={params}
				/>
			);
		},
	},
});

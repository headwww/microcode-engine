import basicProps from './basic';
import columnsProps from './columns';
import styleProps from './style';
import editProps from './edit';
import columnConfigProps from './columnConfig';
import rowProps from './row';
import otherProps from './other';
import actionsProps from './actions';
import rowSelectorProps from './rowSelector';
import seqConfigProps from './seqConfig';
import toolBarProps from './toolBar';
import pagerProps from './pager';
import footerProps from './footer';
import treeProps from './tree';
import formProps from './form';
import menuProps from './menu';

export default [
	...basicProps,
	...columnsProps,
	...formProps,
	...toolBarProps,
	...actionsProps,
	...menuProps,
	...footerProps,
	...rowSelectorProps,
	...pagerProps,
	...seqConfigProps,
	...styleProps,
	...editProps,
	...columnConfigProps,
	...rowProps,
	...treeProps,
	...otherProps,
];

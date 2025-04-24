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

export default [
	...basicProps,
	...columnsProps,
	...actionsProps,
	...rowSelectorProps,
	...seqConfigProps,
	...styleProps,
	...editProps,
	...columnConfigProps,
	...rowProps,
	...otherProps,
];

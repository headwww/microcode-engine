/**
 * 模拟 umd 库
 */
import * as componentInstances from './plugins/materials';

export * from './plugins/materials';

const library = 'ArvinMicrocode';

const execCompile = !!true;
const coveredComponents = {};

if (execCompile) {
	(window as any)[library] = {
		__esModule: true,
		...(componentInstances || {}),
		...(coveredComponents || {}),
	};
}

declare global {
	interface Window {
		ArvinMicrocodeEngine: any;
	}
	namespace JSX {
		type Element = VNode;
		type ElementClass = DefineComponent;
		interface ElementAttributesProperty {
			$props: any;
		}
		interface IntrinsicElements {
			[elem: string]: any;
		}
		interface IntrinsicAttributes {
			[elem: string]: any;
		}
	}
}
export {};

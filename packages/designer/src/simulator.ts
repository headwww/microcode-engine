export interface ISimulatorHost<P = object> {
	setProps(props: P): void;
	// 模拟器iframe的window
	readonly contentWindow?: Window;
	// 模拟器iframe的document
	readonly contentDocument?: Document;
}

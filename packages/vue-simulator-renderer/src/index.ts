import renderer from './renderer';
// import renderer from './simulator';

if (typeof window !== 'undefined') {
	(window as any).SimulatorRenderer = renderer;
}

window.addEventListener('beforeunload', () => {
	(window as any).ArvinMicrocodeSimulatorHost = null;
	(window as any).SimulatorRenderer = null;
	(renderer as any).dispose();
	const appElement: any = document.getElementById('simulator-app');
	if (appElement && appElement.__vue_app__) {
		// 卸载vue应用
		appElement.__vue_app__.unmount();
	}
});

export default renderer;

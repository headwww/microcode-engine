export function makeEventsHandler(boostEvent: MouseEvent | DragEvent) {
	const topDoc = window.document;
	const sourceDoc = boostEvent.view?.document || topDoc;
	const docs = new Set<Document>();
	docs.add(topDoc);
	docs.add(sourceDoc);

	return (handle: (sdoc: Document) => void) => {
		docs.forEach((doc) => handle(doc));
	};
}

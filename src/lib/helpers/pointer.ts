type PointerEvents = {
	enter?: (e: PointerEvent) => void;
	move?: (e: PointerEvent) => void;
	leave?: (e: PointerEvent) => void;
};

export function onPointerEvents(canvas: HTMLCanvasElement, { enter, move, leave }: PointerEvents) {
	function onPointerEnter(e: PointerEvent) {
		enter?.(e);
		canvas.addEventListener("pointermove", move);
		canvas.addEventListener("pointerout", onPointerOut, { once: true });
	}

	function onPointerOut(e: PointerEvent) {
		leave?.(e);
		canvas.removeEventListener("pointermove", move);
	}

	canvas.addEventListener("pointerenter", onPointerEnter);

	function stop() {
		canvas.removeEventListener("pointerenter", onPointerEnter);
		canvas.removeEventListener("pointermove", move);
		canvas.removeEventListener("pointerout", onPointerOut);
	}

	return stop;
}

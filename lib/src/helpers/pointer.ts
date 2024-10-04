type PointerEvents = {
	enter?: (e: PointerEvent) => void;
	move?: (e: PointerEvent) => void;
	leave?: (e: PointerEvent) => void;
};

export function onPointerEvents(canvas: HTMLCanvasElement, { enter, move, leave }: PointerEvents) {
	function onPointerEnter(e: PointerEvent) {
		enter?.(e);
		if (typeof move === "function") {
			canvas.addEventListener("pointermove", move);
		}
		canvas.addEventListener("pointerout", onPointerOut, { once: true });
	}

	function onPointerOut(e: PointerEvent) {
		leave?.(e);
		if (typeof move === "function") {
			canvas.removeEventListener("pointermove", move);
		}
	}

	canvas.addEventListener("pointerenter", onPointerEnter);

	function stop() {
		canvas.removeEventListener("pointerenter", onPointerEnter);
		if (typeof move === "function") {
			canvas.removeEventListener("pointermove", move);
		}
		canvas.removeEventListener("pointerout", onPointerOut);
	}

	return stop;
}

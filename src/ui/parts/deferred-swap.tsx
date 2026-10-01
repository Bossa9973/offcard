import type { ReactNode } from "react";
import { useEffect, useState } from "react";

// Elements claim their name during React's RENDER phase but release it in a commit-phase
// cleanup, and the runtime allows one consumer mount per name. React finishes rendering before
// it commits anything, so swapping one surface for another creates the incoming element while
// the outgoing one still holds the name, and the runtime throws. Holding the incoming surface
// back one tick lets the outgoing cleanup run first. Keyed on whatever identifies the surface,
// so it re-arms on every swap.
export function DeferredSwap({ children }: { children: ReactNode }) {
	const [ready, setReady] = useState(false);

	useEffect(() => {
		setReady(true);
	}, []);

	return ready ? <>{children}</> : null;
}

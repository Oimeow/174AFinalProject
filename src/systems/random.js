/**
 * Seeded random number generator (found a "mulberry32" algorithm online, similar to minecraft!).
 * Same seed -> same sequence of numbers, so a planet's buildings come out
 * identical on every visit. There's some weird bit manipulation stuff i found in the sample code that i don't really get but if it works it works.
 * @param {number} seed any integer
 * @returns {() => number} call it for a number in [0, 1), just like Math.random()
 */
export function createRandom(seed) {
	let state = seed | 0;
	return () => {
		state = (state + 0x6d2b79f5) | 0;
		let t = Math.imul(state ^ (state >>> 15), state | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

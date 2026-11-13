import * as THREE from 'three';

export const TALK_RADIUS = 2; // the blue ring is 4x4 units; standing inside it lets you talk

/**
 * Purple bean guy with googly eyes. Feet at y = 0, faces +Z, 2 units tall (one person).
 * @param {number} color body color
 * @returns {THREE.Group} the whole NPC; move/rotate the group to place him
 */
export function createNpc(color = 0x9d8ce0) {
	const npc = new THREE.Group();

	// Body - cylinder with rounded ends Total height = middle section + 2 * radius = 1 + 1 = 2.
	const body = new THREE.Mesh(
		new THREE.CapsuleGeometry(0.5, 1, 8, 16),
		new THREE.MeshPhongMaterial({ color, shininess: 40 })
	);
	body.position.y = 1; // capsule is centered on its middle; lift it so the bottom touches the ground
	npc.add(body);

	// Both eyes share these approx geometries/materials.
	const eyeGeometry = new THREE.SphereGeometry(0.20, 16, 16);
	const pupilGeometry = new THREE.SphereGeometry(0.08, 8, 8);
	const eyeMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff, shininess: 80 });
	const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x111111 });

	for (const side of [-1, 1]) { // -1 = his right eye, 1 = his left eye
		const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
		eye.position.set(side * 0.2, 1.45, 0.42); // near the top, bulging out of the front of the body
		npc.add(eye);

		const pupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
		pupil.position.set(side * 0.03, 0, 0.13); // relative to the eye: on its front, nudged outward (googly)
		eye.add(pupil); // child of the eye, so it moves with it
	}

	// Blue ring on the ground in front of him: stand inside it to talk.
	const ring = new THREE.Mesh(
		new THREE.RingGeometry(TALK_RADIUS - 0.15, TALK_RADIUS, 48), // inner radius, outer radius, smoothness
		new THREE.MeshBasicMaterial({ color: 0x3399ff, side: THREE.DoubleSide }) // Basic = unlit, so it's like a glowing marker
	);
	ring.rotation.x = -Math.PI / 2; // RingGeometry faces +Z by default; lay it flat on the ground
	ring.position.set(0, 0.02, TALK_RADIUS + 0.5); // in front of it (+Z), edge touching its body just above the grid lines
	npc.add(ring);
	npc.userData.talkZone = ring; // userData = Three.js's spot for your own info; SurfaceWorld checks distance to this

	return npc;
}

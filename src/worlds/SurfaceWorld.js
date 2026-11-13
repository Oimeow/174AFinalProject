// 2d infinite terrain world

import * as THREE from 'three';

const EYE_HEIGHT = 1.85; // person is 2 units tall, estimate eye height TODO: move to constants.js

// Used for any planet param that isn't passed in to enter().
const DEFAULT_PARAMS = {
	groundColor: 0x4e7a0b, // brown-greenish
	skyColor: 0x87ceeb, //sky blue
	size: 100, // temp side length of the square world
};

export class SurfaceWorld {

	/** @param {THREE.WebGLRenderer} renderer */

	constructor(renderer) {
		this.renderer = renderer;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
	}

	/**
	 * Build the world. Called when the player lands on a planet.
	 * @param {object} params planet settings - missing fields fall back to DEFAULT_PARAMS
	 */

	enter(params = {}) {
		const planet = { ...DEFAULT_PARAMS, ...params }; // defaults - ... in js just means use params defined above, overridden by whatever was passed in
		this.planet = planet;

		this.scene.background = new THREE.Color(planet.skyColor);
		this.scene.fog = new THREE.Fog(planet.skyColor, 20, planet.size / 2); // hides the world's edge with built in fog!

		// Soft fill light: sky color from above, ground color bounced from below.
		const hemiLight = new THREE.HemisphereLight(planet.skyColor, planet.groundColor, 0.6);

		// "Sun": one direction for the whole world, gives objects a lit side and a dark side.
		const sun = new THREE.DirectionalLight(0xffffff, 1.5); 

		sun.position.set(30, 50, 20); // TODO: replace with relative position to star globally

		this.scene.add(hemiLight, sun);

		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry(planet.size, planet.size),
			new THREE.MeshPhongMaterial({ color: planet.groundColor })
		);

		ground.rotation.x = -Math.PI / 2; // PlaneGeometry faces +Z by default; lay it flat facing +Y
		this.scene.add(ground);

		// Faint grid so you can tell you're moving on untextured floor.
		const grid = new THREE.GridHelper(planet.size, planet.size / 2, 0x000000, 0x000000);
		grid.material.transparent = true;
		grid.material.opacity = 0.15;

		grid.position.y = 0.01; // just above the ground so the two don't flicker (z-fighting hehe)
		this.scene.add(grid);

		this.camera.position.set(0, EYE_HEIGHT, 0);
		this.camera.rotation.set(0, 0, 0);
	}

	/** @param {number} dt seconds since last frame */
	update(dt) {}

	/** Tear down the world and free GPU memory. Called when leaving the planet. */
	exit() {
		// Three.js doesn't free GPU memory on its own; every geometry and material must be disposed.
		this.scene.traverse((obj) => {
			if (obj.geometry) obj.geometry.dispose();

			// A mesh can have one material or an array of them.
			if (Array.isArray(obj.material)) {
				obj.material.forEach((material) => material.dispose());
			} else if (obj.material) {
				obj.material.dispose();
			}
		});

		this.scene.clear(); // remove everything from the scene so enter() starts fresh
        
	}

	onResize(width, height) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
}

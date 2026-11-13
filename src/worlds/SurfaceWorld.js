// 2d infinite terrain world

import * as THREE from 'three';
import {
	EYE_HEIGHT, WALK_SPEED, MOUSE_SENSITIVITY,
	BUILDING_COUNT, BUILDING_MIN_WIDTH, BUILDING_MAX_WIDTH, BUILDING_MIN_HEIGHT, BUILDING_MAX_HEIGHT,
} from '../constants.js';
import { createRandom } from '../systems/random.js';
import { createNpc, TALK_RADIUS } from '../models/npc.js';

const Y_AXIS = new THREE.Vector3(0, 1, 0);
const MAX_PITCH = Math.PI / 2 - 0.01; // slightly less than straight up/down so the view can't flip over
const SPAWN_CLEAR_RADIUS = 8; // no buildings this close to the center, so you never spawn inside one (also covers the NPC)
const NPC_POSITION = new THREE.Vector3(5, 0, -5); // in front of spawn, off to the right
const GRID_SPACING = 2; // visual only distance between the ground grid lines

// Used for any planet param that isn't passed in to enter().
const DEFAULT_PARAMS = {
	groundColor: 0x4e7a0b, // brown-greenish
	skyColor: 0x87ceeb, //sky blue
	buildingColor: 0x8a8f99, // grey
	size: 100, // temp side length of the square world
	seed: 1, // same seed -> same building layout
	name: 'PLANET', // shown in the HUD
};

export class SurfaceWorld {

	/**
	 * @param {THREE.WebGLRenderer} renderer
	 * @param {import('../ui/hud.js').Hud} hud shared HUD, owned by the page (not the world)
	 */

	constructor(renderer, hud) {
		this.renderer = renderer;
		this.hud = hud;
		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

		this.yaw = 0;   // turn left/right, radians around world Y
		this.pitch = 0; // look up/down, radians around the camera's X

		this.keys = new Set(); // codes of keys currently held down, e.g. 'KeyW'
	}

	/**
	 * Build the world. Called when the player lands on a planet.
	 * @param {object} params planet settings - missing fields fall back to DEFAULT_PARAMS
	 */

	enter(params = {}) {
		const planet = { ...DEFAULT_PARAMS, ...params }; // defaults - ... in js just means use params defined above, overridden by whatever was passed in
		this.planet = planet;
		this.hud.setPlanet(planet.name);

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
		const grid = new THREE.GridHelper(planet.size, planet.size / GRID_SPACING, 0x000000, 0x000000);
		grid.material.transparent = true;
		grid.material.opacity = 0.15;

		grid.position.y = 0.01; // just above the ground so the two don't flicker (z-fighting hehe)
		this.scene.add(grid);

		this.generateBuildings(planet);

		this.npc = createNpc();
		this.npc.position.copy(NPC_POSITION);
		this.npc.rotation.y = Math.atan2(-NPC_POSITION.x, -NPC_POSITION.z); // turn to face the spawn point (origin)
		this.scene.add(this.npc);
		this.talkZoneCenter = this.npc.userData.talkZone.getWorldPosition(new THREE.Vector3()); // NPC never moves, so compute once
		this.inTalkZone = false;

		this.camera.position.set(0, EYE_HEIGHT, 0); //set start position as center of map, no need to change later

		this.yaw = 0;
		this.pitch = 0;

		this.renderer.domElement.addEventListener('click', this.handleClick);
		document.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('keydown', this.handleKeyDown);
		window.addEventListener('keyup', this.handleKeyUp);
		window.addEventListener('blur', this.handleBlur);
	}

	/**
	 * Place BUILDING_COUNT boxes of random size at random spots. Buildings may overlap for now.
	 * @param {object} planet the merged planet params from enter()
	 */
	generateBuildings(planet) {
		const random = createRandom(planet.seed);
		const between = (min, max) => min + random() * (max - min); // random number in [min, max)
		const geometry = new THREE.BoxGeometry(1, 1, 1); // starts as this, mesh scales box
		const baseColor = new THREE.Color(planet.buildingColor);
		const half = planet.size / 2;

		let placed = 0;
		// Cap the attempts so a crowded world can't loop forever if spots keep getting rejected.
		for (let attempt = 0; attempt < BUILDING_COUNT * 10 && placed < BUILDING_COUNT; attempt++) {
			const width = between(BUILDING_MIN_WIDTH, BUILDING_MAX_WIDTH);   // along x
			const depth = between(BUILDING_MIN_WIDTH, BUILDING_MAX_WIDTH);   // along z
			const height = between(BUILDING_MIN_HEIGHT, BUILDING_MAX_HEIGHT);

			// Center point, chosen so the whole footprint stays inside the world.
			const x = between(-half + width / 2, half - width / 2);
			const z = between(-half + depth / 2, half - depth / 2);

			// Distance from spawn (the origin) to the nearest point of this footprint.
			const nearestX = THREE.MathUtils.clamp(0, x - width / 2, x + width / 2);
			const nearestZ = THREE.MathUtils.clamp(0, z - depth / 2, z + depth / 2);
			if (Math.hypot(nearestX, nearestZ) < SPAWN_CLEAR_RADIUS) continue; // too close, try another spot

			const color = baseColor.clone().offsetHSL(0, 0, (random() - 0.5) * 0.2); // a bit lighter/darker
			const building = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({ color }));
			building.scale.set(width, height, depth);
			building.position.set(x, height / 2, z); // box is centered on its middle, so lift it by half its height
			this.scene.add(building);
			placed++;
		}
	}

	/** @param {number} dt seconds since last frame */

	update(dt) {

		// WASD as a direction relative to the camera, where -Z is forward and +X is right.
		const move = new THREE.Vector3();
		if (this.keys.has('KeyW')) move.z -= 1;
		if (this.keys.has('KeyS')) move.z += 1;
		if (this.keys.has('KeyA')) move.x -= 1;
		if (this.keys.has('KeyD')) move.x += 1;

		if (move.lengthSq() > 0 && !this.hud.isDialogOpen) { // no walking while the dialog is up
			move.normalize(); // so diagonals aren't faster
			move.applyAxisAngle(Y_AXIS, this.yaw); // rotate into world space to match where you're facing
			this.camera.position.addScaledVector(move, WALK_SPEED * dt);
		}

		// Standing inside the NPC's blue ring? (distance on the ground only, ignoring height)
		const dx = this.camera.position.x - this.talkZoneCenter.x;
		const dz = this.camera.position.z - this.talkZoneCenter.z;
		this.inTalkZone = Math.hypot(dx, dz) < TALK_RADIUS;
		this.hud.setPrompt(this.inTalkZone && !this.hud.isDialogOpen ? 'Press E to talk' : null);

		// 'YXZ' = turn (yaw) first, then tilt (pitch), so looking up/down never tips the horizon sideways.

		this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
	}

	// Arrow functions so this still means the world when the browser calls them as event listeners.
	handleClick = () => {
		this.renderer.domElement.requestPointerLock(); // hides cursor, gives raw mouse movement. Esc releases.
	};

	handleMouseMove = (event) => {
		if (document.pointerLockElement !== this.renderer.domElement) return; // only look while mouse is captured

		// Mouse right -> turn right (negative yaw). Mouse up -> look up (positive pitch).
		this.yaw -= event.movementX * MOUSE_SENSITIVITY;
		this.pitch -= event.movementY * MOUSE_SENSITIVITY;
		this.pitch = THREE.MathUtils.clamp(this.pitch, -MAX_PITCH, MAX_PITCH);
	};

	// event.code is the physical key, so WASD works on any keyboard layout hopefully but everyone should be on WASD so it's chill
	handleKeyDown = (event) => {
		this.keys.add(event.code);
		if (event.code === 'KeyE' && !event.repeat && this.inTalkZone && !this.hud.isDialogOpen) {
			this.openTalk();
		}
	};
	handleKeyUp = (event) => this.keys.delete(event.code);
	handleBlur = () => this.keys.clear(); // if window lost focus: forget held keys so you don't keep walking

	/** Open the NPC dialog: free the mouse so the box can be clicked; closing it puts you back in the game. */
	openTalk() {
		this.keys.clear(); // stop walking
		document.exitPointerLock();
		this.hud.openDialog(() => this.renderer.domElement.requestPointerLock());
	}

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

		this.renderer.domElement.removeEventListener('click', this.handleClick);
		document.removeEventListener('mousemove', this.handleMouseMove);
		window.removeEventListener('keydown', this.handleKeyDown);
		window.removeEventListener('keyup', this.handleKeyUp);
		window.removeEventListener('blur', this.handleBlur);
		this.keys.clear();
		if (document.pointerLockElement) document.exitPointerLock();
	}

	onResize(width, height) {
		this.camera.aspect = width / height;
		this.camera.updateProjectionMatrix();
	}
}

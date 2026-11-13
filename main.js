import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshPhongMaterial ( { 
	color: 0x00ff00,
} );
const cube = new THREE.Mesh( geometry, material );
const controls = new OrbitControls(camera, renderer.domElement);
scene.add( cube );

camera.position.z = 5;
camera.position.y = 1;

/**
 * Generate a homogeneous translation matrix
 * @param {number} tx amount to translate on x
 * @param {number} ty amount to translate on y
 * @param {number} tz amount to translate on z
 * @returns Translation matrix
 */
function genMatrixTranslate(tx, ty, tz) {
	return new THREE.Matrix4(1, 0, 0, tx,
							0, 1, 0, ty,
							0, 0, 1, tz,
							0, 0, 0, 1);
}

/**
 * Generate a homogeneous scaling matrix
 * @param {number} sx amount to scale on x
 * @param {number} sy amount to scale on y
 * @param {number} sz amount to scale on z
 * @returns Scaling matrix
 */
function genMatrixScale(sx, sy, sz) {
	return new THREE.Matrix4(sx, 0, 0, 0,
							0, sy, 0, 0,
							0, 0, sz, 0,
							0, 0, 0, 1);
}

/**
 * Generate a homogeneous rotation matrix
 * @param {string} axis 'x', 'y', or 'z' axis
 * @param {number} rads rotation in radians
 * @returns Rotation matrix
 */
function genMatrixRot(axis, rads) {	// axis is char 'x' 'y' or 'z'
	let cos_rad = Math.cos(rads);
	let sin_rad = Math.sin(rads);

	if (axis == 'x') {
		return new THREE.Matrix4(
			1, 	0, 			0, 				0,
			0, 	cos_rad, 	-1 * sin_rad,	0,
			0, 	sin_rad, 	cos_rad,		0,
			0, 	0, 			0, 				1
		)
	}
	else if (axis == 'y') {
		return new THREE.Matrix4(
			cos_rad, 		0, 	sin_rad, 	0,
			0, 				1,	0, 			0,
			-1 * sin_rad, 	0, 	cos_rad,	0,
			0, 				0, 	0, 			1
		)
	}
	else if (axis == 'z') {
		return new THREE.Matrix4(
			cos_rad,	-1 * sin_rad,	0,	0,
			sin_rad, 	cos_rad, 		0, 	0,
			0, 			0, 				1, 	0,
			0, 			0, 				0, 	1
		)
	}
	else
		throw("genMatrixRot: Something went wrong. Is axis a char? (It should be)");
}

/**
 * Generates a Mesh with Phong material
 * @param {number} radius size of the planet
 * @param {*} color color of the planet, as accepted by MeshPhongMaterial
 * @param {THREE.Texture} bumpMap a bumpmap; optional
 * @returns Spherical mesh
 */
function genPlanet(radius, color, bumpMap = new THREE.Texture()) {
	let nSegments = 64;
	geometry = new THREE.SphereGeometry(radius, nSegments, nSegments);
	material = new THREE.MeshPhongMaterial(
		{color: color, bumpMap: bumpMap
		// TODO: shininess/specular? (yes?)
		});

	return new THREE.Mesh(geometry, material);
}

function createAxisLine(color, start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
}

function start() {
	const controls = new OrbitControls(camera, renderer.domElement);
	camera.position.set(0, 5, 10); // Where the camera is.
	controls.target.set(0, 5, 0); // Where the camera is looking towards.

	// Create axis lines
	const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0)); // Red
	const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0)); // Green
	const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 2)); // Blue


	// Add axes to scene
	scene.add(xAxis);
	scene.add(yAxis);
	scene.add(zAxis);
}

start();

function animate() {
	controls.update(); // This will update the camera position and target based on the user input.
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;

	renderer.render( scene, camera );

}


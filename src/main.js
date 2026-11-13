import * as THREE from 'three';
import * as SPACE from './space.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10_000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const keys = {};
const controls = new PointerLockControls(camera, document.body);
document.addEventListener('keydown', (e) => {
	keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
	keys[e.code] = false;
})
document.addEventListener('click', () => { controls.lock(); } );

let space;

camera.position.z = 5;
camera.position.y = 1;

function start() {
	camera.position.set(0, 5, 140); // Where the camera is.

	const light = new THREE.PointLight(0xffffff, 1_000, 0, 1);  // falls off like 1/r
	const ambient = new THREE.AmbientLight(0xffffff, 0.2);
	light.position.set(0,0,0);

	scene.add(ambient);
	scene.add(light);

	space = SPACE.randomGenerateSpace(8);
	scene.add(space.objs);
}

const moveSpeed = 50;
function moveCamera(dt) {
	const speed = moveSpeed * dt;

	if (keys['KeyW']) controls.moveForward(speed);
	if (keys['KeyS']) controls.moveForward(-speed);

	if (keys['KeyA']) controls.moveRight(-speed);
	if (keys['KeyD']) controls.moveRight(speed);

	if (keys['Space']) camera.position.y += speed;
	if (keys['ShiftLeft']) camera.position.y -= speed;
}

start();

function animate() {

	controls.update(); // This will update the camera position and target based on the user input.

	const dt = clock.getDelta();  // delta time

	if (controls.isLocked)  { moveCamera(dt); }

	SPACE.updateSpace(space, dt);

	renderer.render( scene, camera );

}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import * as helper from './helpers.js';

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

let timer = new THREE.Timer();	// Clock is deprecated



function createAxisLine(color, start, end) {
    const geometry = new THREE.BufferGeometry().setFromPoints([start, end]);
    const material = new THREE.LineBasicMaterial({ color: color });
    return new THREE.Line(geometry, material);
}

// TODO this is for testing only
let sun = helper.genStar(10, 0xFF00FF);
let plan1 = helper.genPlanet(5, 0xFFFFFF);
let plan2 = helper.genPlanet(6, 0x00FFFF);

function start() {
	const controls = new OrbitControls(camera, renderer.domElement);
	camera.position.set(0, 5, 10); // Where the camera is.
	controls.target.set(0, 5, 0); // Where the camera is looking towards.

	// Create axis lines
	const xAxis = createAxisLine(0xff0000, new THREE.Vector3(0, 0, 0), new THREE.Vector3(2, 0, 0)); // Red
	const yAxis = createAxisLine(0x00ff00, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2, 0)); // Green
	const zAxis = createAxisLine(0x0000ff, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 2)); // Blue

	// TODO this is for testing only
	scene.add(sun);
	scene.add(plan1);
	scene.add(plan2);
}

start();

function animate() {

	controls.update(); // This will update the camera position and target based on the user input.
	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;


	// TODO This is for testing only
	if (helper.isColliding(plan1, plan2))
		console.log("Crash!");
	helper.orbit(plan1, 0, 'y', 0, timer);
	helper.orbit(plan2, 0, 'y', 0, timer);


	timer.update();	// this is required to update the timer
	renderer.render( scene, camera );

}


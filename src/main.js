import * as THREE from 'three';
import * as SPACE from './space.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const clock = new THREE.Clock();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement);

let star;  // json of vals
let planets;  // json of lists

camera.position.z = 5;
camera.position.y = 1;

function start() {
	camera.position.set(0, 5, 70); // Where the camera is.
	controls.target.set(0, 5, 0); // Where the camera is looking towards.

	star = SPACE.generateStar(30, 64, 0xff0000);  // is a json
	planets = SPACE.randomGenerateSpace(star, 1, 8);  // is a json

	const light = new THREE.PointLight(0xffffff, 1_000, 0, 1);  // falls off like 1/r
	const ambient = new THREE.AmbientLight(0xffffff, 0.2);
	light.position.set(0,0,0);

	scene.add(ambient);
	scene.add(light);

	scene.add( planets.objs );
	scene.add( star.obj );
}

start();

function animate() {
	controls.update(); // This will update the camera position and target based on the user input.

	const dt = clock.getDelta();  // delta time

	SPACE.orbitPlanets(planets, dt);

	renderer.render( scene, camera );

}


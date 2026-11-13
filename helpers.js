import * as THREE from 'three';

/**
 * Generate a homogeneous translation matrix
 * @param {number} tx amount to translate on x
 * @param {number} ty amount to translate on y
 * @param {number} tz amount to translate on z
 * @returns Translation matrix
 */
export function genMatrixTranslate(tx, ty, tz) {
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
export function genMatrixScale(sx, sy, sz) {
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
export function genMatrixRot(axis, rads) {	// axis is char 'x' 'y' or 'z'
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
export function genPlanet(radius, color, bumpMap = new THREE.Texture()) {

	let nSegments = 64;
	let geometry = new THREE.SphereGeometry(radius, nSegments, nSegments);
	let material = new THREE.MeshPhongMaterial(
		{color: color, bumpMap: bumpMap
		// shininess/specularity may be considered in the futuer
		});

	return new THREE.Mesh(geometry, material);
}

/**
 * Generates a star, acting as a point light source
 * @param {number} radius radius of the star 
 * @param {*} color color of the star
 */
export function genStar(radius, color) {
	let nSegments = 64;
	let geometry = new THREE.SphereGeometry(radius, nSegments, nSegments);
	let material = new THREE.MeshBasicMaterial({color: color});

	let star = new THREE.Mesh(geometry, material);
	let light = new THREE.PointLight(color, 1, 0, 0);
	
	star.add(light);

	return star;
}

/**
 * Orbit an object around the origin
 * @param {THREE.mesh} object object to orbit
 * @param {number} distance distance from the origin 
 * @param {string} axis 'x' or 'y' or 'z', denoting the axis of rotation 
 * @param {number} velocity orbital velocity in rads/sec 
 * @param {THREE.Timer} timer an existing THREE timer object
 */
export function orbit(object, distance, axis, velocity, timer) {
	
	let translate = genMatrixTranslate(distance, 0, 0);
	let rotate = genMatrixRot(axis, velocity * timer.getElapsed());

	let transform = new THREE.Matrix4();
	transform.multiplyMatrices(translate, transform);
	transform.multiplyMatrices(rotate, transform);

	object.matrix.copy(transform);
	object.matrixAutoUpdate = false;
}
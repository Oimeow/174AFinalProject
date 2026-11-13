import * as THREE from 'three';


/**
 * @param {number} radius radius of star
 * @param {number} subdivisions # of subdivisions
 * @param {number} color color of star
 * @returns Mesh of star with given properties
 */
export function generateStar(radius, subdivisions, color) {
    const starGeo = new THREE.SphereGeometry(radius, subdivisions, subdivisions);
    const starMat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 2
    });

    return {
        obj: new THREE.Mesh(starGeo, starMat),
        radius: radius,
        mass: Math.pow(radius, 1.25),
        color: color
    };
}

export function generatePlanet(radius, subdivisions, color) {
    const planetGeo = new THREE.SphereGeometry(radius, subdivisions, subdivisions);
    const planetMat = new THREE.MeshPhongMaterial({
        color: color

    });

    return new THREE.Mesh(planetGeo, planetMat);
}

/**
 * Generate a THREE.Scene object for space.
 * @param {JSON} star given star of the system
 * @param {number} seed seed for random generation
 * @param {number} numPlanets number of planets in system
 * @returns THREE.Scene object with star/planets
 */
export function randomGenerateSpace(star, seed, numPlanets) {
    let planets = {
        objs: new THREE.Group(), 
        speeds: [],
        radii: [],
        dists: [],
        masses: []
    };

    const dr = 20;
    let r_prev = star.radius;

    for (let i = 1; i <= numPlanets; i++) {
        const color = randomHSL(0.5, 1.0, 0.5, 0.8);
        const dist = r_prev + randomf(dr, dr * 1.5) * Math.cbrt(i);
        const radius = randomf(0.6, 0.8) * (dist - r_prev) * 0.5;
        const mass = randomf(0.5, 10) * radius;  // arbitrary mass units, might need to better define
        
        const th = randomf(0, 6.28);  // random starting angle.

        let p = generatePlanet(radius, 30, color);
        p.position.set(dist * Math.cos(th), 0, dist * Math.sin(th));

        const speed = Math.sqrt(star.mass * 1.0 / dist)  // need to implement G constant.

        planets.objs.add(p);
        planets.speeds.push(speed);
        planets.radii.push(radius);
        planets.dists.push(dist);
        planets.masses.push(mass);

        r_prev = dist;
    }

    return planets
}


/** Calculates the orbits of the planets.
 * @param {JSON} planets planets object
 * @param {number} dt delta tiem since last frame
 */
export function orbitPlanets(planets, dt) {
	planets.objs.children.forEach((planet, i) => {
		const speed = planets.speeds[i];
		const omega = speed / planets.dists[i];

		const deltaTheta = omega * dt * 100;
		// const deltaTheta = dt;

		planet.position.applyAxisAngle(
			new THREE.Vector3(0,1,0),
			deltaTheta
		);
	})
}


/**
 * Generates a random color on [a,b] (0 -> 1)
 * @param {number} a min
 * @param {number} b max
 * @returns random color on [a,b] x [a,b] x [a,b]
 */
function randomColor(a, b) {
    return new THREE.Color(
        randomf(a,b),
        randomf(a,b),
        randomf(a,b)
    );
}


/**
 * Generates a random HSL color on [0,1] x [Smin, Smax] x [Lmin, Lmax] (0 -> 1)
 * @param {number} a min
 * @param {number} b max
 * @returns random color on [a,b] x [a,b] x [a,b]
 */
function randomHSL(Smin, Smax, Lmin, Lmax) {
    const color = new THREE.Color();

    color.setHSL(
        randomf(0,1),
        randomf(Smin, Smax),
        randomf(Lmin, Lmax)
    );

    return color;
}


/**
 * Generates a random float on [a,b]
 * @param {number} a min
 * @param {number} b max
 * @returns random float on [a,b]
 */
function randomf(a, b) {
    return a + Math.random() * (b-a);
}

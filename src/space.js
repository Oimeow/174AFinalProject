import * as THREE from 'three';
import { TrailRenderer } from './trailRenderer';


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
    const geo = new THREE.SphereGeometry(radius, subdivisions, subdivisions);
    const mat = new THREE.MeshPhongMaterial({color: color});

    return new THREE.Mesh(geo, mat);
}

/**
 * Generate a faux atmosphere mesh.
 * @param {number} radius radius of the underlying planet
 * @param {THREE.Color} color planetary color and, thus, atmosphere color
 * @returns THREE.Mesh 
 */
export function generateAtmosphere(radius, color) {
    const atmosphereThickness = randomf(0.99, 1.2);
    const geo = new THREE.SphereGeometry(
        radius * atmosphereThickness, 32, 32
    );  // just barely enveloping the planet

    const mat = new THREE.MeshPhongMaterial({
        color: color, 
        transparent: true, 
        opacity: 0.2,
        side: THREE.DoubleSide,
        depthWrite: false
    });

    return new THREE.Mesh(geo, mat);
}
// ^^^ replace with Fresnel shader later

/**
 * Generate a JSON object for the environment.
 * @param {JSON} star given star of the system
 * @param {number} seed seed for random generation (not yet implemented)
 * @param {number} numPlanets number of planets in system
 * @returns THREE.Scene object with star/planets
 */
export function randomGenerateSpace(star, seed, numPlanets) {
    let planets = {
        objs: new THREE.Group(), 
        meshes: [],
        trails: [],
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
        const speed = Math.sqrt(star.mass * 1.0 / dist)  // need to implement G constant.

        const th = randomf(0, 6.28);  // random starting angle.

        let p = generatePlanet(radius, 30, color);
        let atmosphere = generateAtmosphere(radius, color);
        
        const planetSystem = new THREE.Group();
        planetSystem.add(p);
        planetSystem.add(atmosphere);
        planetSystem.position.set(dist * Math.cos(th), 0, dist * Math.sin(th));

        const trail = new TrailRenderer(color, 100);

        planets.objs.add(trail.line);
        planets.objs.add(planetSystem);

        planets.meshes.push(planetSystem);
        planets.trails.push(trail);

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
	planets.meshes.forEach((planet, i) => {
		const speed = planets.speeds[i];
		const omega = speed / planets.dists[i];

		const deltaTheta = omega * dt * 100;

        // rotate/increment around solar system axis
		planet.position.applyAxisAngle(
			new THREE.Vector3(0,1,0),
			deltaTheta
		);

        planets.trails[i].update(planet.position);
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

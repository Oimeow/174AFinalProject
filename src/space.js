import * as THREE from 'three';
import { Star, Planet } from './spaceObjects.js'

/**
 * Generate a JSON object for the environment.
 * @param {JSON} star given star of the system
 * @param {number} seed seed for random generation (not yet implemented)
 * @param {number} numPlanets number of planets in system
 * @returns THREE.Scene object with star/planets
 */
export function randomGenerateSpace(numPlanets = 8) {
    const space = {
        objs: new THREE.Group(),
        star: null,
        planets: []
    };

    const star = new Star({
        radius: 100,
        color: 0xffcc44,  // nice looking color,
        mass: 1_000
    });

    space.star = star;
    space.objs.add(star.obj);

    let d_prev = star.radius;
    const dd = star.radius;

    for (let i = 0; i < numPlanets; i++) {
        const dist = d_prev + dd * Math.cbrt(i + 1);
        const radius = randomf(0.6, 0.8) * (dist - d_prev) * 0.3;

        const omega = Math.sqrt(star.mass / Math.pow(dist, 3));

        const p = new Planet({
            radius: radius,
            color: randomHSL(0.5, 1.0, 0.5, 1.0),
            orbitRadius: dist,
            omega: omega,
            initialAngle: Math.random() * 2 * Math.PI
        });

        space.planets.push(p);
        space.objs.add(p.obj);

        if (p.trail !== null) {
            space.objs.add(p.trail.line);
        }

        d_prev = dist;
    }

    return space;
}


/** Calculates the orbits of the planets.
 * @param {JSON} planets planets object
 * @param {number} dt delta tiem since last frame
 */
export function updateSpace(space, dt) {
	space.star.update(dt);

    for (const p of space.planets) {
        p.update(dt * 10);
    }
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

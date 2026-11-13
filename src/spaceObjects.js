import * as THREE from "three";
import { TrailRenderer } from './trailRenderer.js';


export class Star {
    constructor({
        radius = 30,
        color = 0xffaaaa,
        mass = 1000,
        nSegs = 64
    } = {}) 
    {
        // self-explanatory instantiation.
        this.radius = radius;
        this.mass = mass;
        this.obj = new THREE.Group();

        const geo = new THREE.SphereGeometry(radius, nSegs, nSegs);
        const mat = new THREE.MeshStandardMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 1
        });

        this.mesh = new THREE.Mesh(geo, mat);
        this.obj.add(this.mesh);
    }

    update(dt) {
        // rotate maybe?
    }
}

export class Planet {
    constructor({
        radius = 1,
        color = 0xffffff,
        orbitRadius = 50,
        omega = 0.01,
        initialAngle = 0,
        hasAtmosphere = true,
        hasTrail = true
    } = {}) {
        this.radius = radius;
        this.orbitRadius = orbitRadius;
        this.omega = omega;
        this.angle = initialAngle;

        this.obj = new THREE.Group();  // contains planet + atmosphere

        const geo = new THREE.SphereGeometry(radius, 32, 32);
        const mat = new THREE.MeshPhongMaterial({ color: color });

        this.mesh = new THREE.Mesh(geo, mat);
        this.obj.add(this.mesh);

        if (hasAtmosphere) {
            const atmosphereGeo = new THREE.SphereGeometry(
                radius * randomf(0.99, 1.2), 32, 32
            );

            const atmosphereMat = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide,
                depthWrite: false
            })

            this.atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);

            this.obj.add(this.atmosphere);
        }

        this.trail = hasTrail ? new TrailRenderer(color, 100) : null;

        this.updatePosition();
    }

    updatePosition() {
        this.obj.position.set(
            this.orbitRadius * Math.cos(this.angle), 0, this.orbitRadius * Math.sin(this.angle)
        );
    }

    update(dt) {
        this.angle += this.omega * dt;
        this.updatePosition();

        if (this.trail !== null) {
            this.trail.update(this.obj.position);
        }
    }
}

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
 * Generates a random float on [a,b]
 * @param {number} a min
 * @param {number} b max
 * @returns random float on [a,b]
 */
function randomf(a, b) {
    return a + Math.random() * (b-a);
}

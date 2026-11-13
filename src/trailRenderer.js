import * as THREE from "three";

export class TrailRenderer {
    constructor(color, maxN=100) {
        this.maxN = maxN;
        this.positions = []

        this.geo = new THREE.BufferGeometry();
        const verts = new Float32Array(maxN * 3);
        this.geo.setAttribute('position', new THREE.BufferAttribute(verts, 3));

        this.mat = new THREE.LineBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.5
        });

        this.line = new THREE.Line(this.geo, this.mat);
        this.line.frustumCulled = false;
    }

    update(pos) {
        this.positions.push(pos.clone());

        if (this.positions.length > this.maxN) {
            this.positions.shift();  // basically .pop()
        }

        const verts = this.geo.attributes.position.array;

        for (let i = 0; i < this.maxN; i++) {
            const p = this.positions[i];

            // index the position into the buffer
            if (p) {
                verts[i * 3] = p.x;
                verts[i * 3 + 1] = p.y;
                verts[i * 3 + 2] = p.z;
            } 
            else {
                verts[i * 3] = pos.x;
                verts[i * 3 + 1] = pos.y;
                verts[i * 3 + 2] = pos.z;
            }
        }

        this.geo.attributes.position.needsUpdate = true;
        this.geo.setDrawRange(0, this.positions.length);
        this.geo.computeBoundingSphere();
    }
}
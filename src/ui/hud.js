// ram collected, current world, popups, etc
// Plain HTML laid over the canvas :D

const STYLE = `
.hud { position: fixed; inset: 0; pointer-events: none; font-family: system-ui, sans-serif; color: #fff; }
.hud-bar { display: flex; justify-content: space-between; align-items: center;
	height: 40px; padding: 0 16px; background: rgba(0, 0, 0, 0.5);
	font-size: 16px; font-weight: 600; letter-spacing: 0.05em; }
`;

export class Hud {
	constructor() {
		// pointer-events - none so lets clicks pass through to the canvas, so pointer lock still works.
		this.root = document.createElement('div');
		this.root.className = 'hud';
		this.root.innerHTML = `
			<style>${STYLE}</style>
			<div class="hud-bar">
				<span class="hud-planet"></span>
				<span class="hud-ram"></span>
			</div>
		`;
		this.planetEl = this.root.querySelector('.hud-planet');
		this.ramEl = this.root.querySelector('.hud-ram');

		this.setPlanet('PLANET');
		this.setRam(0);
	}

	/** Put the HUD on the page. */
	show() {
		document.body.appendChild(this.root);
	}

	/** Take the HUD off the page. */
	hide() {
		this.root.remove();
	}

	/** @param {string} name planet name shown on the left */
	setPlanet(name) {
		this.planetEl.textContent = `🪐 ${name}`;
	}

	/** @param {number} count RAM collected so far, shown on the right */
	setRam(count) {
		this.ramEl.textContent = `${count} RAM`;
	}
}

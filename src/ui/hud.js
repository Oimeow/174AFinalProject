// ram collected, current world, popups, etc
// Plain HTML laid over the canvas :D

const STYLE = `
.hud { position: fixed; inset: 0; pointer-events: none; font-family: system-ui, sans-serif; color: #fff; }
.hud-bar { display: flex; justify-content: space-between; align-items: center;
	height: 40px; padding: 0 16px; background: rgba(0, 0, 0, 0.5);
	font-size: 16px; font-weight: 600; letter-spacing: 0.05em; }
.hud-prompt { position: absolute; left: 50%; bottom: 25%; transform: translateX(-50%);
	padding: 8px 14px; border-radius: 6px; background: rgba(0, 0, 0, 0.6); font-size: 16px; font-weight: 600; }
.hud-dialog-backdrop { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
	background: rgba(0, 0, 0, 0.35); pointer-events: auto; } /* auto: blocks clicks from reaching the game behind it */
.hud-dialog { width: min(560px, calc(100% - 32px)); height: 320px; display: flex; align-items: center; justify-content: center;
	background: rgba(15, 18, 28, 0.92); border: 2px solid #3399ff; border-radius: 12px; }
.hud-dialog-close { font-size: 96px; line-height: 1; color: #fff; background: none; border: none; cursor: pointer; }
.hud [hidden] { display: none !important; } /* otherwise display: flex above would override the hidden attribute */
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
			<div class="hud-prompt" hidden></div>
			<div class="hud-dialog-backdrop" hidden>
				<div class="hud-dialog">
					<button class="hud-dialog-close" aria-label="Close">✕</button>
				</div>
			</div>
		`;
		this.planetEl = this.root.querySelector('.hud-planet');
		this.ramEl = this.root.querySelector('.hud-ram');
		this.promptEl = this.root.querySelector('.hud-prompt');
		this.dialogEl = this.root.querySelector('.hud-dialog-backdrop');

		this.promptText = null;
		this.onDialogClose = null;
		this.root.querySelector('.hud-dialog-close').addEventListener('click', () => this.closeDialog());

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

	/** @param {string|null} text hint above the bottom of the screen, or null to hide it */
	setPrompt(text) {
		if (text === this.promptText) return; // called every frame; skip when nothing changed
		this.promptText = text;
		this.promptEl.hidden = !text;
		if (text) this.promptEl.textContent = text;
	}

	get isDialogOpen() {
		return !this.dialogEl.hidden;
	}

	/** @param {() => void} [onClose] runs when the player closes the dialog */
	openDialog(onClose) {
		this.onDialogClose = onClose;
		this.dialogEl.hidden = false;
	}

	closeDialog() {
		this.dialogEl.hidden = true;
		if (this.onDialogClose) this.onDialogClose();
		this.onDialogClose = null;
	}
}

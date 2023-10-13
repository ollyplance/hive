import { Hive } from "./hive.js";

class playGame extends Phaser.Scene {
	constructor() {
		super();
	}

	preload() {
		// Load assets
	}

	create() {
		var hexSize = 18;
		const numRows = 22;
		const numCols = 22;

		var cam = this.cameras.main;

		cam.setBounds(
			0,
			0,
			hexSize * 2 * (numCols - 1),
			hexSize * 2 * (numRows - 1)
		);
		cam.setViewport(0, 0, 800, 800);
		cam.centerOn((numCols * hexSize) / 2, (numRows * hexSize) / 2);
		cam.setZoom(1);

		this.input.mousePointer.motionFactor = 0.5;
		this.input.pointer1.motionFactor = 0.5;

		// help from https://codepen.io/samme/pen/XWJxgRG
		this.input.on("pointermove", function (p) {
			if (!p.isDown) return;

			const { x, y } = p.velocity;

			cam.scrollX -= x / cam.zoom;
			cam.scrollY -= y / cam.zoom;
		});

		this.hive = new Hive(this, hexSize, numRows, numCols);
	}
}

let gameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: 0xffffff,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		parent: "canvas-container",
	},
	scene: playGame,
};

var game = new Phaser.Game(gameConfig);

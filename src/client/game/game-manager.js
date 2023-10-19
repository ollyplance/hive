import { PlayerSide, Side } from "./player";

import { Hive } from "./hive";
import Phaser from "phaser";

export class GameManager extends Phaser.Scene {
	constructor() {
		super({ key: "GameManager" });
	}

	preload() {
		// Load assets
	}

	create() {
		const hexSize = 20;
		const numCols = 25;
		const numRows = Math.ceil(numCols * (3 / 4));

		const cam = this.cameras.main;

		cam.setBounds(0, 0, hexSize * (3 / 4) * numRows, hexSize * 2 * numRows);
		cam.setViewport(0, 0, 800, hexSize * 2 * numRows);
		cam.centerOn((numCols * hexSize) / 2, (numRows * hexSize) / 2);
		cam.setZoom(1);

		this.input.mousePointer.motionFactor = 0.5;
		this.input.pointer1.motionFactor = 0.5;

		// TODO: Add camera movement back in at the end
		// help from https://codepen.io/samme/pen/XWJxgRG
		this.input.on("pointermove", function (p) {
			if (!p.isDown) return;

			const { x, y } = p.velocity;

			cam.scrollX -= x / cam.zoom;
			cam.scrollY -= y / cam.zoom;
		});

		const escapeKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC
		);

		this.hive = new Hive(this, hexSize, numRows, numCols);

		// scroll through pieces
		this.whiteSide = new PlayerSide(this, Side.White);
		this.blackSide = new PlayerSide(this, Side.Black);

		this.currentPlayer = this.whiteSide;

		this.game.scene.start("GameUI", {
			whiteSide: this.whiteSide,
			blackSide: this.blackSide,
		});

		this.events.emit("updateUI", this.currentPlayer.side);

		escapeKey.on("down", () => {
			this.currentPlayer.pieceClicked = null;
		});
	}

	turnOver() {
		// TODO: check for queen captured
		this.currentPlayer =
			this.currentPlayer.side === this.blackSide.side
				? this.whiteSide
				: this.blackSide;
		if (this.whiteSide.checkQueenSurrounded()) {
			console.log("Black wins!");
		}
		if (this.blackSide.checkQueenSurrounded()) {
			console.log("White wins!");
		}
		this.events.emit("updateUI", this.currentPlayer.side);
		this.hive.nextTurn();
	}
}

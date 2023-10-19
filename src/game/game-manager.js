import { Ant, Beetle, Grasshopper, Queen, Spider } from "./pieces";

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
		var hexSize = 20;
		const numCols = 25;
		const numRows = Math.ceil(numCols * (3 / 4));

		var cam = this.cameras.main;

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

		var escapeKey = this.input.keyboard.addKey(
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

class PlayerSide {
	constructor(gameManager, side) {
		this.gameManager = gameManager;
		this.side = side;
		this.pieces = [];
		this.pieceClicked = null;
		this.numMoves = 0;
		this.queen = null;
		this.createPieces();
	}

	createPieces() {
		for (var i = 0; i < 3; i++) {
			if (i < 1) {
				this.queen = new Queen(this.gameManager.hive, this);
				this.pieces.push(this.queen);
			}
			if (i < 2) {
				this.pieces.push(
					new Spider(this.gameManager.hive, this),
					new Beetle(this.gameManager.hive, this)
				);
			}
			if (i < 3) {
				this.pieces.push(
					new Grasshopper(this.gameManager.hive, this),
					new Ant(this.gameManager.hive, this)
				);
			}
		}
	}

	checkQueenSurrounded() {
		if (!this.queen || !this.queen.currHex) {
			return false;
		}
		// if surrounded, game is over, player loses
		for (var i = 0; i < 6; i++) {
			let offset = this.gameManager.hive.getOffsetFromHex(
				this.queen.currHex.neighbor(i)
			);
			let cell = this.gameManager.hive.getCellFromOffset(offset);
			if (!cell.piece.length) {
				return false;
			}
		}
		return true;
	}

	makeMove(cell, hex) {
		this.numMoves += 1;
		let prevHex = this.pieceClicked.currHex;
		if (prevHex) {
			let prevCell = this.gameManager.hive.getCellFromHex(prevHex);
			if (prevCell) {
				prevCell.piece.pop();
				prevCell.updateUI();
			}
		}
		this.pieceClicked.currHex = hex;
		cell.piece.push(this.pieceClicked);
		this.pieceClicked = null;
		this.gameManager.turnOver();
	}
}

export const Side = {
	White: true,
	Black: false,
};

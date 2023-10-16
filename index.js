import { Ant, Beetle, Grasshopper, Piece, Queen, Spider } from "./pieces.js";
import {
	DoubledCoord,
	Hex,
	Layout,
	OffsetCoord,
	Orientation,
	Point,
} from "./js/hexgrid.js";
import { Hive, PiecesLeftUI } from "./hive.js";

class GameManager extends Phaser.Scene {
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

		// this.input.mousePointer.motionFactor = 0.5;
		// this.input.pointer1.motionFactor = 0.5;

		// TODO: Add camera movement back in at the end
		// help from https://codepen.io/samme/pen/XWJxgRG
		// this.input.on("pointermove", function (p) {
		// 	if (!p.isDown) return;

		// 	const { x, y } = p.velocity;

		// 	cam.scrollX -= x / cam.zoom;
		// 	cam.scrollY -= y / cam.zoom;
		// });
		var escapeKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC
		);

		this.hive = new Hive(this, hexSize, numRows, numCols);

		// scroll through pieces
		this.whiteSide = new PlayerSide(this, Side.White, 700, 440);
		this.blackSide = new PlayerSide(this, Side.Black, 700, 60);

		this.currentPlayer = this.whiteSide;

		escapeKey.on("down", () => {
			this.currentPlayer.pieceClicked = null;
		});
	}

	turnOver() {
		this.currentPlayer =
			this.currentPlayer.side === this.blackSide.side
				? this.whiteSide
				: this.blackSide;
		this.hive.nextTurn();
	}
}

class PlayerSide {
	constructor(gameManager, side, xPos, yPos) {
		this.gameManager = gameManager;
		this.side = side;
		this.pieces = [];
		this.firstMove = true;
		this.pieceClicked = null;
		this.createPieces();
		this.piecesUI = new PiecesLeftUI(this.gameManager, this, xPos, yPos);
	}

	createPieces() {
		for (var i = 0; i < 3; i++) {
			if (i < 1) {
				this.pieces.push(new Queen(this.gameManager.hive, this));
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

	makeMove(cell, hex) {
		this.firstMove = false;
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
		this.piecesUI.updateUI();
		this.gameManager.turnOver();
	}
}

export const Side = {
	White: true,
	Black: false,
};

let gameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 800,
	backgroundColor: 0xffffff,
	scale: {
		autoCenter: Phaser.Scale.CENTER_BOTH,
		parent: "canvas-container",
	},
	scene: GameManager,
};

var game = new Phaser.Game(gameConfig);

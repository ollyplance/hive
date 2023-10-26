import { PlayerSide, Side } from "./player";

import { GameState } from "../../server/HiveState";
import { Hive } from "./hive";
import { OffsetCoord } from "./js/hexgrid.js";
import Phaser from "phaser";
import { Queen } from "./pieces.js";

export class GameManager extends Phaser.Scene {
	constructor() {
		super({ key: "GameManager" });
	}

	preload() {
		// Load assets
	}

	async create(data) {
		const { server, onGameOver } = data;

		this.server = server;
		this.onGameOver = onGameOver;

		if (!this.server) {
			throw new Error("server instance missing");
		}

		await this.server.join();

		this.server.onceStateChanged(this.createGame, this);
	}

	createGame() {
		this.hexSize = 20;
		this.numCols = 25;
		this.numRows = Math.ceil(this.numCols * (3 / 4));

		const cam = this.cameras.main;

		cam.setBounds(
			0,
			0,
			this.hexSize * (3 / 4) * this.numRows,
			this.hexSize * 2 * this.numRows
		);
		cam.setViewport(0, 0, 800, this.hexSize * 2 * this.numRows);
		cam.centerOn(
			(this.numCols * this.hexSize) / 2,
			(this.numRows * this.hexSize) / 2
		);
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

		this.pieceClicked = null;
		this.numMoves = 0;
		this.queen = null;
		this.currentTurn = false;

		if (this.server?.gameState === GameState.WaitingForPlayers) {
			this.side = Side.White;
			this.addText("Waiting for opponent...");
		} else if (this.server?.gameState === GameState.Playing) {
			this.side = Side.Black;
			this.makeGame();
			this.addText("Opponent's turn...");
		}

		const escapeKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.ESC
		);

		escapeKey.on("down", () => {
			this.pieceClicked = null;
		});

		// this.server?.onBoardChanged(this.handleBoardChanged, this);
		this.server?.onPlayerTurnChanged(this.handlePlayerTurnChanged, this);
		// this.server?.onPlayerWon(this.handlePlayerWon, this);
		this.server?.onGameStateChanged(this.handleGameStateChanged, this);
		this.server?.onNewMove(this.handleNewMove, this);
	}

	makeMove(toHex) {
		this.numMoves += 1;
		const fromHex = this.pieceClicked.currHex;
		const fromOffset = this.hive.getOffsetFromHex(fromHex);
		const toOffset = this.hive.getOffsetFromHex(toHex);
		this.pieceClicked = null;

		// TODO: CheckQueenSurrounded

		this.server?.makeSelection(
			fromOffset ? fromOffset.row : -1,
			fromOffset ? fromOffset.col : -1,
			toOffset ? toOffset.row : -1,
			toOffset ? toOffset.col : -1
		);
	}

	addText(text) {
		const width = this.scale.width;
		this.gameStateText = this.add
			.text(width * 0.5, 100, text, {
				fontSize: "32px",
				fill: 0xfff,
			})
			.setOrigin(0.5);
	}

	removeText() {
		this.gameStateText.destroy();
		this.gameStateText = undefined;
	}

	makeGame() {
		if (this.gameStateText) {
			this.gameStateText.destroy();
			this.gameStateText = undefined;
		}
		this.hive = new Hive(this, this.hexSize, this.numRows, this.numCols);
	}

	checkQueenSurrounded() {
		if (!this.queen || !this.queen.currHex) {
			return false;
		}
		// if surrounded, game is over, player loses
		for (let i = 0; i < 6; i++) {
			const offset = this.hive.getOffsetFromHex(this.queen.currHex.neighbor(i));
			const cell = this.hive.getCellFromOffset(offset);
			if (!cell.piece.length) {
				return false;
			}
		}
		return true;
	}

	handleNewMove(newMove) {
		const fromCell = this.hive.data[newMove.from.row][newMove.from.col];
		const toCell = this.hive.data[newMove.to.row][newMove.to.col];

		const piece = fromCell.piece.pop();
		fromCell.updateUI();

		piece.currHex = OffsetCoord.qoffsetToCube(
			OffsetCoord.ODD,
			new OffsetCoord(newMove.to.col, newMove.to.row)
		);
		piece.active = true;

		if (piece.side === this.side && piece instanceof Queen) {
			this.queen = piece;
		}
		toCell.piece.push(piece);
		toCell.updateUI();
	}

	handlePlayerTurnChanged(playerIndex) {
		this.currentTurn = playerIndex === this.server?.playerIndex;
		if (this.currentTurn) {
			this.removeText();
		} else {
			this.addText("Opponent's turn...");
		}
	}

	handleGameStateChanged(state) {
		if (state === GameState.Playing) {
			this.currentTurn = true;
			this.makeGame();
		}
	}
}

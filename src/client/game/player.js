import { Ant, Beetle, Grasshopper, Queen, Spider } from "./pieces";

export class PlayerSide {
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
		for (let i = 0; i < 3; i++) {
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
		for (let i = 0; i < 6; i++) {
			const offset = this.gameManager.hive.getOffsetFromHex(
				this.queen.currHex.neighbor(i)
			);
			const cell = this.gameManager.hive.getCellFromOffset(offset);
			if (!cell.piece.length) {
				return false;
			}
		}
		return true;
	}

	makeMove(cell, hex) {
		this.numMoves += 1;
		const prevHex = this.pieceClicked.currHex;
		if (prevHex) {
			const prevCell = this.gameManager.hive.getCellFromHex(prevHex);
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

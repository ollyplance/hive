import { Hex, OffsetCoord } from "./js/hexgrid.js";

class Piece {
	constructor(hive, side) {
		this.hive = hive;
		this.side = side;
		this.name = "";
		this.color = 0xcccccc;
		this.currHex = null;
	}

	// returns if move is valid
	legalMove(toHex, data) {
		if (!this.currHex) {
			// TODO: check for color
			let offset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, toHex);
			let cell = data[offset.row][offset.col];
			// can not place an initial piece ontop of another or make an island

			// add dummy cell to board -- deleted later
			cell.piece.push(this);
			let result =
				!(cell?.piece.length > 1) && this.checkForIslands(data);
            cell.piece.pop();
            return result;
		}
		return this.legalMovePerPiece(toHex, data);
	}

	// returns if move is valid acording to piece's properties
	legalMovePerPiece(toHex, data) {
        return false
    }

	// // TODO: Later -- for giving valid spaces before hand - turn on or off in the future
	// getMovesFrom(hex, data) {
	// 	return [];
	// }

	// DFS of board to find outer ring of possible moves.
	// TODO: In the future I can give possible spots - for now, I want to just
	// get the game working lol....
	getInitialPlacements(data, side) {
		const validPlacements = new Set();
		const seen = new Set();
		for (var row = 0; row < data.length; row++) {
			for (var col = 0; col < data[0].length; col++) {
				if (data[row][col].piece.length && !seen.has(`${row},${col}`)) {
					searchForPlacements(row, col);
				}
			}
		}

		function searchForPlacements(row, col) {
			seen.add(`${row},${col}`);
			for (var i = 0; i < data[row][col].neighbors.length; i++) {
				const offset = data[row][col].neighbors[i];
				if (
					0 <= offset.row &&
					offset.row < data.length &&
					0 <= offset.col &&
					offset.col < data[0].length
				) {
					// check for color
					if (
						data[offset.row][offset.col].piece.length &&
						!seen.has(`${offset.row},${offset.col}`)
					) {
						searchForPlacements(offset.row, offset.col);
					} else if (data[offset.row][offset.col].piece.length == 0) {
						validPlacements.add(`${offset.row},${offset.col}`);
					}
				}
			}
		}
		// TODO: check to make sure only touching sides pieces
		function checkEmpty() {}
		return validPlacements;
	}

	// checks to make sure move does not break board
	checkForIslands(data) {
		const seen = new Set();
		var i = 0;
		for (var row = 0; row < data.length; row++) {
			for (var col = 0; col < data[0].length; col++) {
				if (data[row][col].piece.length && !seen.has(`${row},${col}`)) {
					search(row, col);
					i += 1;
				}
				if (i > 1) {
					return false;
				}
			}
		}
		function search(row, col) {
			seen.add(`${row},${col}`);
			for (var i = 0; i < data[row][col].neighbors.length; i++) {
				const offset = data[row][col].neighbors[i];
				if (
					0 <= offset.row &&
					offset.row < data.length &&
					0 <= offset.col &&
					offset.col < data[0].length
				) {
					// check for color
					if (
						data[offset.row][offset.col].piece.length &&
						!seen.has(`${offset.row},${offset.col}`)
					) {
						search(offset.row, offset.col);
					}
				}
			}
		}
		return true;
	}
}

class Queen extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Queen Bee";

		this.color = 0xfcba03;
	}

	legalMovePerPiece(toHex, data) {
		return true;
	}
}

class Grasshopper extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = Grasshopper;
		this.color = 0x31a843;
	}

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

class Beetle extends Piece {
	constructor(hive) {
		super(hive);
		this.name = "Beetle";
		this.color = 0xc225af;
	}

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

class Spider extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Spider";
		this.color = 0xbd3b2f;
	}

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

class Ant extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Soldier Ant";
		this.color = 0x2666b5;
	}

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

export { Piece, Ant, Spider, Beetle, Grasshopper, Queen };

import { Hex, OffsetCoord } from "./js/hexgrid.js";

import { Side } from "./index.js";

class Piece {
	constructor(hive, playerSide) {
		this.hive = hive;
		this.playerSide = playerSide;
		this.name = "";
		this.currHex = null;
		this.borderColor =
			this.playerSide.side === Side.White ? 0xdfd3c3 : 0x8b7e74;
		this.color = 0xcccccc;
	}

	// returns if move is valid
	legalMove(toHex) {
		if (!this.currHex) {
			if (
				!this.playerSide.firstMove &&
				!this.checkNeighborColors(toHex)
			) {
				return false;
			}
			let offset = this.hive.getOffsetFromHex(toHex);
			let cell = this.hive.getCellFromOffset(offset);
			// can not place an initial piece ontop of another or make an island
			return !(cell?.piece.length >= 1) && this.checkForIslands(toHex);
		}
		return this.legalMovePerPiece(toHex);
	}

	checkNeighborColors(toHex) {
		for (var i = 0; i < 6; i++) {
			let offset = this.hive.getOffsetFromHex(toHex.neighbor(i));
			let cell = this.hive.getCellFromOffset(offset);
			if (
				cell.piece.length &&
				cell.piece[cell.piece.length - 1].playerSide.side !==
					this.playerSide.side
			) {
				return false;
			}
		}
		return true;
	}

	// checks to make sure move does not break board
	// TODO: make sure board isnt broken during transit as well
	checkForIslands(toHex) {
		const seen = new Set();
		let data = this.hive.data;
		let offset = this.hive.getOffsetFromHex(toHex);
		let prevOffset = this.hive.getOffsetFromHex(this.currHex);
		var i = 0;

		for (var row = 0; row < data.length; row++) {
			for (var col = 0; col < data[0].length; col++) {
				if (
					pieceExists(row, col, offset, prevOffset) &&
					!seen.has(`${row},${col}`)
				) {
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
				const nOffset = data[row][col].neighbors[i];
				if (
					0 <= nOffset.row &&
					nOffset.row < data.length &&
					0 <= nOffset.col &&
					nOffset.col < data[0].length
				) {
					if (
						pieceExists(
							nOffset.row,
							nOffset.col,
							offset,
							prevOffset
						) &&
						!seen.has(`${nOffset.row},${nOffset.col}`)
					) {
						search(nOffset.row, nOffset.col);
					}
				}
			}
		}

		function pieceExists(row, col, newPieceOffset, prevPieceOffset) {
			// if there is nothing in the row but the new piece is there
			// or
			// there is something in the row and the old piece does not exist or the old piece is not there
			// or
			// there is something in the row and the old piece is there but there is more than one piece
			return (
				(!data[row][col].piece.length &&
					newPieceOffset.row === row &&
					newPieceOffset.col === col) ||
				(data[row][col].piece.length &&
					(!prevPieceOffset ||
						prevPieceOffset.row !== row ||
						prevPieceOffset.col !== col)) ||
				(prevPieceOffset &&
					prevPieceOffset.row === row &&
					prevPieceOffset.col === col &&
					data[row][col].piece.length > 1)
			);
		}

		return true;
	}

	// returns if move is valid acording to piece's properties
	legalMovePerPiece(toHex) {
		return false;
	}

	// // TODO: Later -- for giving valid spaces before hand - turn on or off in the future
	// getMovesFrom(hex, data) {
	// 	return [];
	// }

	// DFS of board to find outer ring of possible moves.
	// TODO: In the future I can give possible spots - for now, I want to just
	// get the game working lol....
	// getInitialPlacements(data, side) {
	// 	const validPlacements = new Set();
	// 	const seen = new Set();
	// 	for (var row = 0; row < data.length; row++) {
	// 		for (var col = 0; col < data[0].length; col++) {
	// 			if (data[row][col].piece.length && !seen.has(`${row},${col}`)) {
	// 				searchForPlacements(row, col);
	// 			}
	// 		}
	// 	}

	// 	function searchForPlacements(row, col) {
	// 		seen.add(`${row},${col}`);
	// 		for (var i = 0; i < data[row][col].neighbors.length; i++) {
	// 			const offset = data[row][col].neighbors[i];
	// 			if (
	// 				0 <= offset.row &&
	// 				offset.row < data.length &&
	// 				0 <= offset.col &&
	// 				offset.col < data[0].length
	// 			) {
	// 				// check for color
	// 				if (
	// 					data[offset.row][offset.col].piece.length &&
	// 					!seen.has(`${offset.row},${offset.col}`)
	// 				) {
	// 					searchForPlacements(offset.row, offset.col);
	// 				} else if (data[offset.row][offset.col].piece.length == 0) {
	// 					validPlacements.add(`${offset.row},${offset.col}`);
	// 				}
	// 			}
	// 		}
	// 	}
	// 	// TODO: check to make sure only touching sides pieces
	// 	function checkEmpty() {}
	// 	return validPlacements;
	// }
}

class Queen extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Queen Bee";
		this.color = 0xf1c27b;
	}

	legalMovePerPiece(toHex) {
		// check to make sure piece is not moved on top of an existing piece
		let offset = this.hive.getOffsetFromHex(toHex);
		if (this.hive.getCellFromOffset(offset).piece.length) {
			return false;
		}
		for (var i = 0; i < 6; i++) {
			//neighbor is within 1 hex of prev piece and check islands
			if (
				toHex.neighbor(i).equal(this.currHex) &&
				this.checkForIslands(toHex)
			) {
				return true;
			}
		}
		return false;
	}
}

class Grasshopper extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Grasshopper";
		this.color = 0x79ac78;
	}

	legalMovePerPiece(toHex) {
		return false;
	}
}

class Beetle extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Beetle";
		this.color = 0xbeadfa;
	}

	legalMovePerPiece(toHex) {
		for (var i = 0; i < 6; i++) {
			// new placement is within 1 hex of prev piece and check islands
			if (
				toHex.neighbor(i).equal(this.currHex) &&
				this.checkForIslands(toHex)
			) {
				return true;
			}
		}
		return false;
	}
}

class Spider extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Spider";
		this.color = 0xef9595;
	}

	legalMovePerPiece(toHex) {
		// check to make sure piece is not moved on top of an existing piece
		let offset = this.hive.getOffsetFromHex(toHex);
		if (this.hive.getCellFromOffset(offset).piece.length) {
			return false;
		}
		// remove piece from space for now
		let currOffset = this.hive.getOffsetFromHex(this.currHex);
		let piece = this.hive.getCellFromOffset(currOffset).piece.pop();

		const seenSet = new Set();

		// backtracking search from the new position to old position
		function search(offset, distance, seen, hive) {
			let offsetCube = OffsetCoord.qoffsetToCube(OffsetCoord.ODD, offset);
			if (
				distance === 3 &&
				offset.row === currOffset.row &&
				offset.col === currOffset.col
			) {
				return true;
			}
			seen.add(`${offset.row},${offset.col}`);
			for (var i = 0; i < 6; i++) {
				let nOffset = hive.getOffsetFromHex(offsetCube.neighbor(i));
				// if new cell has not been seen before
				let rightNeighbor = (i + 1) % 6;
				let leftNeighbor = i ? i - 1 : 5;
				// if direction is not closed off
				if (
					!hive.getCellFromHex(offsetCube.neighbor(rightNeighbor))
						.piece.length ||
					!hive.getCellFromHex(offsetCube.neighbor(leftNeighbor))
						.piece.length
				) {
					let nCell = hive.getCellFromOffset(nOffset);
					let cCell = hive.getCellFromOffset(offset);
					// nCells neighboring pieces
					let nNeighborPieces = nCell.getNeighborsWithPieces();
					// currCells neighboring pieces
					let cNeighborPieces = new Set(
						cCell.getNeighborsWithPieces()
					);
					// nCell does not have a piece already and
					// neighborCell has at least one similar neighboring pieces
					if (
						!nCell.piece.length &&
						nNeighborPieces.filter((x) => {
							return cNeighborPieces.has(x);
						}).length
					) {
						if (
							!seen.has(`${nOffset.row},${nOffset.col}`) &&
							search(nOffset, distance + 1, seen, hive)
						) {
							return true;
						}
					}
				}
			}
			seen.delete(`${offset.row},${offset.col}`);
			return false;
		}
		let result = search(offset, 0, seenSet, this.hive);
		this.hive.getCellFromOffset(currOffset).piece.push(piece);
		return result && this.checkForIslands(toHex);
	}
}

class Ant extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Soldier Ant";
		this.color = 0x96b6c5;
	}

	legalMovePerPiece(toHex) {
		return false;
	}
}

export { Piece, Ant, Spider, Beetle, Grasshopper, Queen };

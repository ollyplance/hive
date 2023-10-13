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
	legalMove(toHex, data) {
		if (!this.currHex) {
			if (
				!this.playerSide.firstMove &&
				!this.checkNeighborColors(toHex, data)
			) {
				return false;
			}
			let offset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, toHex);
			let cell = data[offset.row][offset.col];
			// // add dummy cell to board -- deleted later
			// cell.piece.push(this);
			// // can not place an initial piece ontop of another or make an island
			let result =
				!(cell?.piece.length >= 1) && this.checkForIslands(toHex, data);
			// cell.piece.pop();
			return result;
		}
		return this.legalMovePerPiece(toHex, data);
	}

	checkNeighborColors(toHex, data) {
		for (var i = 0; i < 6; i++) {
			let offset = OffsetCoord.qoffsetFromCube(
				OffsetCoord.ODD,
				toHex.neighbor(i)
			);
			let cell = data[offset.row][offset.col];
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

	// movePiecesAndCheckIslands(toHex, data) {
	// 	let offset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, toHex);
	// 	let cell = data[offset.row][offset.col];
	// 	// add dummy cell to board -- deleted later
	// 	cell.piece.push(this);
	// 	let prevCell = null
	// 	let prevPiece = null
	// 	if (this.currHex) {
	// 		let prevOffset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, this.currHex);
	// 		prevCell = data[prevOffset.row][prevOffset.col];
	// 		prevPiece = currCell.pop()
	// 	}
	// 	// can not place an initial piece ontop of another or make an island
	// 	let result =
	// 		!(cell?.piece.length > 1) && this.checkForIslands(data);
	// 	cell.piece.pop();
	// 	if (prevCell && prevPiece) {
	// 		prevCell.push(prevPiece);
	// 	}
	// 	return result;
	// }

	// checks to make sure move does not break board
	checkForIslands(toHex, data) {
		const seen = new Set();
		const offset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, toHex);
		const prevOffset = this.currHex
			? OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, toHex)
			: null;
		var i = 0;
		for (var row = 0; row < data.length; row++) {
			for (var col = 0; col < data[0].length; col++) {
				// check if piece is either the new cell or not the old cell
				if (!(prevOffset && prevOffset.row === row && prevOffset.col === col && data[row][col].piece.length <= 1)
					&& (data[row][col].piece.length ||
						(offset.row === row && offset.col === col)) &&
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
						!(
							prevOffset &&
							prevOffset.row === nOffset.row &&
							prevOffset.col === nOffset.col &&
							data[nOffset.row][nOffset.col].piece.length <= 1
						) &&
						(data[nOffset.row][nOffset.col].piece.length ||
							(offset.row === nOffset.row &&
								offset.col === nOffset.col)) &&
						!seen.has(`${nOffset.row},${nOffset.col}`)
					) {
						search(nOffset.row, nOffset.col);
					}
				}
			}
		}
		return true;
	}

	// returns if move is valid acording to piece's properties
	legalMovePerPiece(toHex, data) {
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

	legalMovePerPiece(toHex, data) {
		let offset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, toHex);
		if (data[offset.row][offset.col].piece.length) {
			return false;
		}
		for (var i = 0; i < 6; i++) {
			//neighbor is within 1 hex of prev piece
			if (toHex.neighbor(i).equal(this.currHex)) {
				// check islands now too - more expensive

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

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

class Beetle extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Beetle";
		this.color = 0xbeadfa;
	}

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

class Spider extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Spider";
		this.color = 0xef9595;
	}

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

class Ant extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Soldier Ant";
		this.color = 0x96b6c5;
	}

	legalMovePerPiece(toHex, data) {
		return false;
	}
}

export { Piece, Ant, Spider, Beetle, Grasshopper, Queen };

import { OffsetCoord } from "./js/hexgrid.js";
import { Side } from "./game-manager.js";

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
		// if queen has not been placed by 4th move
		if (
			this.playerSide.numMoves >= 3 &&
			this.playerSide.queen &&
			!this.playerSide.queen.currHex &&
			!(this instanceof Queen)
		) {
			return false;
		}
		if (!this.currHex) {
			if (this.playerSide.numMoves && !this.checkNeighborColors(toHex)) {
				return false;
			}
			let offset = this.hive.getOffsetFromHex(toHex);
			let cell = this.hive.getCellFromOffset(offset);
			// can not place an initial piece ontop of another or make an island
			return !(cell?.piece.length >= 1) && this.checkForIslands(toHex);
		}
		return (
			this.playerSide.queen &&
			this.playerSide.queen.currHex &&
			this.legalMovePerPiece(toHex)
		);
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

	// checks to make sure move does not break board during transit
	checkForIslands(toHex) {
		// checks for islands during and after transit of piece
		return (
			checkForIslandsHelper(this.currHex, toHex, this.hive, true) &&
			checkForIslandsHelper(this.currHex, toHex, this.hive, false)
		);

		function checkForIslandsHelper(currHex, toHex, hive, duringTransit) {
			const seen = new Set();
			let data = hive.data;
			let offset = hive.getOffsetFromHex(toHex);
			let prevOffset = hive.getOffsetFromHex(currHex);
			var i = 0;

			for (var row = 0; row < data.length; row++) {
				for (var col = 0; col < data[0].length; col++) {
					if (
						pieceExists(
							row,
							col,
							offset,
							prevOffset,
							duringTransit
						) &&
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
								prevOffset,
								duringTransit
							) &&
							!seen.has(`${nOffset.row},${nOffset.col}`)
						) {
							search(nOffset.row, nOffset.col);
						}
					}
				}
			}

			function pieceExists(
				row,
				col,
				newPieceOffset,
				prevPieceOffset,
				duringTransit
			) {
				// we are not checking in transit islands and there is nothing in the row but the new piece is there
				// or
				// there is something in the row and the old piece does not exist or the old piece is not there
				// or
				// there is something in the row and the old piece is there but there is more than one piece
				return (
					(!duringTransit &&
						!data[row][col].piece.length &&
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
	}

	// backtracking search from the new position to old position
	searchAntSpider(offset, currOffset, seen, distance, maxDistance = null) {
		if (
			(!maxDistance || distance === maxDistance) &&
			offset.row === currOffset.row &&
			offset.col === currOffset.col
		) {
			return true;
		}
		seen.add(`${offset.row},${offset.col}`);
		for (var i = 0; i < 6; i++) {
			let offsetCube = OffsetCoord.qoffsetToCube(OffsetCoord.ODD, offset);
			let nOffset = this.hive.getOffsetFromHex(offsetCube.neighbor(i));

			let rightNeighbor = (i + 1) % 6;
			let leftNeighbor = i ? i - 1 : 5;
			// if direction is not closed off - i.e. can slide into space
			if (
				!this.hive.getCellFromHex(offsetCube.neighbor(rightNeighbor))
					.piece.length ||
				!this.hive.getCellFromHex(offsetCube.neighbor(leftNeighbor))
					.piece.length
			) {
				let nCell = this.hive.getCellFromOffset(nOffset);
				let cCell = this.hive.getCellFromOffset(offset);
				// nCells neighboring pieces
				let nNeighborPieces = nCell.getNeighborsWithPieces();
				// currCells neighboring pieces
				let cNeighborPieces = new Set(cCell.getNeighborsWithPieces());
				// nCell does not have a piece already and
				// neighborCell has at least one similar neighboring pieces
				if (
					!nCell.piece.length &&
					nNeighborPieces.filter((x) => {
						return cNeighborPieces.has(x);
					}).length
				) {
					// if new cell has not been seen before
					if (
						!seen.has(`${nOffset.row},${nOffset.col}`) &&
						this.searchAntSpider(
							nOffset,
							currOffset,
							seen,
							distance + 1,
							maxDistance
						)
					) {
						return true;
					}
				}
			}
		}
		seen.delete(`${offset.row},${offset.col}`);
		return false;
	}

	// returns if move is valid acording to piece's properties
	legalMovePerPiece(toHex) {
		return false;
	}

	// // TODO: Later -- for giving valid spaces before hand - turn on or off in the future

	// DFS of board to find outer ring of possible moves.
	// TODO: In the future I can give possible spots - for now, I want to just
	// get the game working lol....
	// version history for this code.
}

class Queen extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Queen Bee";
		this.color = 0xf1c27b;
	}

	legalMovePerPiece(toHex) {
		// check to make sure piece is not moved on top of an existing piece
		if (this.hive.getCellFromHex(toHex).piece.length) {
			return false;
		}
		for (var i = 0; i < 6; i++) {
			let rightNeighbor = (i + 1) % 6;
			let leftNeighbor = i ? i - 1 : 5;
			// if movement is within 1 hex of current piece
			// and direction is not closed off - i.e. can slide into space
			// and check islands
			if (
				this.currHex.neighbor(i).equal(toHex) &&
				(!this.hive.getCellFromHex(this.currHex.neighbor(rightNeighbor))
					.piece.length ||
					!this.hive.getCellFromHex(
						this.currHex.neighbor(leftNeighbor)
					).piece.length) &&
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
		// check to make sure piece is not moved on top of an existing piece
		if (this.hive.getCellFromHex(toHex).piece.length) {
			return false;
		}

		for (var direction = 0; direction < 6; direction++) {
			let neighborHex = this.currHex.neighbor(direction);
			let neighborCell = this.hive.getCellFromHex(neighborHex);
			// make sure move hops over at least one current piece
			if (neighborCell.piece.length) {
				// get the first open spot
				let firstOpen = firstOpenHex(neighborHex, direction, this.hive);
				if (firstOpen.equal(toHex)) {
					return this.checkForIslands(toHex);
				}
			}
		}
		return false;

		function firstOpenHex(hex, direction, hive) {
			if (!hive.getCellFromHex(hex).piece.length) {
				return hex;
			}
			return firstOpenHex(hex.neighbor(direction), direction, hive);
		}
	}
}

class Beetle extends Piece {
	constructor(hive, side) {
		super(hive, side);
		this.name = "Beetle";
		this.color = 0xbeadfa;
	}

	legalMovePerPiece(toHex) {
		// if piece is moved ontop of existing piece, sliding rules don't apply
		if (this.hive.getCellFromHex(toHex).piece.length) {
			return this.checkForIslands(toHex);
		}
		for (var i = 0; i < 6; i++) {
			let rightNeighbor = (i + 1) % 6;
			let leftNeighbor = i ? i - 1 : 5;
			// if movement is within 1 hex of current piece
			// and direction is not closed off - i.e. can slide into space
			// and check islands
			if (
				this.currHex.neighbor(i).equal(toHex) &&
				(!this.hive.getCellFromHex(this.currHex.neighbor(rightNeighbor))
					.piece.length ||
					!this.hive.getCellFromHex(
						this.currHex.neighbor(leftNeighbor)
					).piece.length) &&
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
		// TODO: make this so you dont need to adjust the board possibly
		let currOffset = this.hive.getOffsetFromHex(this.currHex);
		let piece = this.hive.getCellFromOffset(currOffset).piece.pop();

		const seenSet = new Set();

		let result = this.searchAntSpider(offset, currOffset, seenSet, 0, 3);
		// place piece back on board - move is handled seperately
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

	// a non-limited spider...
	legalMovePerPiece(toHex) {
		let offset = this.hive.getOffsetFromHex(toHex);
		let currOffset = this.hive.getOffsetFromHex(this.currHex);
		// piece is not being moved on top of itself
		if (offset.row === currOffset.row && offset.col === currOffset.col) {
			return false;
		}
		// check to make sure piece is not moved on top of an existing piece
		if (this.hive.getCellFromOffset(offset).piece.length) {
			return false;
		}

		// remove piece from space for now
		let piece = this.hive.getCellFromOffset(currOffset).piece.pop();
		const seenSet = new Set();

		let result = this.searchAntSpider(offset, currOffset, seenSet, 0);
		this.hive.getCellFromOffset(currOffset).piece.push(piece);
		return result && this.checkForIslands(toHex);
	}
}

export { Piece, Ant, Spider, Beetle, Grasshopper, Queen };

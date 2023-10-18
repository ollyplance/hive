import { Layout, OffsetCoord, Point } from "./js/hexgrid.js";
import { blendColors, shrinkHexagon } from "./helper.js";

class Cell {
	constructor(gameManager, hive, row, col) {
		this.gameManager = gameManager;
		this.hive = hive;
		this.row = row;
		this.col = col;

		// stack for bugs
		this.piece = [];
		// list of offset for each cell that is a neighbor
		this.neighbors = [];

		this.hex = OffsetCoord.qoffsetToCube(
			OffsetCoord.ODD,
			new OffsetCoord(this.col, this.row)
		);
		let corners = this.hive.layout.polygonCorners(this.hex);
		let smallerCorners = shrinkHexagon(corners, 4);

		this.hexagon = this.gameManager.add.polygon(0, 0, smallerCorners);

		this.hexagon
			.setInteractive(
				new Phaser.Geom.Polygon(corners),
				Phaser.Geom.Polygon.Contains
			)
			.setFillStyle(this.getCurrentColor())
			.setStrokeStyle(4, 0xeeeeee)
			.on("pointerover", this.pointerOver, this)
			.on("pointerout", this.pointerOut, this)
			.on("pointerdown", this.pointerDown, this);

		this.generateNeighbors();

		this.hive.hexagons.add(this.hexagon);
	}

	getCurrentColor() {
		return this.piece.length
			? this.piece[this.piece.length - 1].color
			: 0xffffff;
	}

	getCurrentStroke() {
		return this.piece.length
			? this.piece[this.piece.length - 1].borderColor
			: 0xeeeeee;
	}

	generateNeighbors() {
		for (var i = 0; i < 6; i++) {
			this.neighbors.push(
				OffsetCoord.qoffsetFromCube(
					OffsetCoord.ODD,
					this.hex.neighbor(i)
				)
			);
		}
	}

	getNeighborsWithPieces() {
		return this.neighbors
			.filter(
				(nOffset) =>
					this.hive.getCellFromOffset(nOffset).piece.length > 0
			)
			.map((offset) => `${offset.row},${offset.col}`);
	}

	updateUI() {
		this.hexagon.setFillStyle(this.getCurrentColor());
		this.hexagon.setStrokeStyle(4, this.getCurrentStroke());
	}

	// TODO: blend colors
	pointerOver() {
		let piece = this.gameManager.currentPlayer.pieceClicked;
		if (piece) {
			this.hexagon.setFillStyle(piece.color);
			this.hexagon.setStrokeStyle(4, piece.borderColor);
		} else {
			// blend hover color with current piece color
			let hoverColor = 0xeeeeee;
			let pieceColor = this.piece.length
				? this.piece[this.piece.length - 1].color
				: 0xdddddd;
			let pieceBorderColor = this.piece.length
				? this.piece[this.piece.length - 1].borderColor
				: 0xdddddd;

			this.hexagon.setFillStyle(blendColors(pieceColor, hoverColor), 1);
			this.hexagon.setStrokeStyle(
				4,
				blendColors(pieceBorderColor, hoverColor),
				1
			);
		}
	}

	pointerOut() {
		this.updateUI();
	}

	// click on hex. What I want to do: if no piece is actively clicked, either make a piece actively clicked
	// or nothing. Else -- check if hex is in active pieces possible moves, then place piece, make active
	// change turn
	pointerDown() {
		let pieceToPlace = this.gameManager.currentPlayer.pieceClicked;
		if (pieceToPlace && pieceToPlace.legalMove(this.hex, this.hive.data)) {
			this.gameManager.currentPlayer.makeMove(this, this.hex);
		} else if (
			!pieceToPlace &&
			this.piece.length &&
			this.piece[this.piece.length - 1].playerSide.side ===
				this.gameManager.currentPlayer.side
		) {
			this.gameManager.currentPlayer.pieceClicked =
				this.piece[this.piece.length - 1];
		}
	}
}

export class Hive {
	constructor(gameManager, hexSize, numRows, numCols) {
		this.gameManager = gameManager;

		this.hexSize = hexSize;
		this.numRows = numRows;
		this.numCols = numCols;

		this.hexagons = this.gameManager.add.group();
		var orientation = Layout.flat;
		this.layout = new Layout(
			orientation,
			new Point(this.hexSize, this.hexSize),
			new Point(this.hexSize * 2, this.hexSize * 2)
		);

		this.data = [];

		this.createCells();
	}

	createCells() {
		for (var row = 0; row < this.numRows; row++) {
			this.data[row] = [];
			for (var col = 0; col < this.numCols; col++) {
				this.data[row][col] = new Cell(
					this.gameManager,
					this,
					row,
					col
				);
			}
		}
	}

	getCellFromHex(hex) {
		let offset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, hex);
		return this.data[offset.row][offset.col];
	}

	getOffsetFromHex(hex) {
		return hex ? OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, hex) : null;
	}

	// TODO: null checks on these
	getCellFromOffset(offset) {
		return this.data[offset.row][offset.col];
	}

	// TODO: take current player and make pieces available -> else set interactive false and make grey
	nextTurn() {}
}

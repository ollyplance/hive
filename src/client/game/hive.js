import { Ant, Beetle, Grasshopper, Queen, Spider } from "./pieces";
import { Layout, OffsetCoord, Point } from "./js/hexgrid.js";
import { blendColors, shrinkHexagon } from "./helper";

import Phaser from "phaser";
import { Side } from "./game-manager";

class Cell {
	constructor(gameManager, hive, row, col, startingPiece) {
		this.gameManager = gameManager;
		this.hive = hive;
		this.row = row;
		this.col = col;

		this.hex = OffsetCoord.qoffsetToCube(
			OffsetCoord.ODD,
			new OffsetCoord(this.col, this.row)
		);

		// stack for bugs
		this.piece = [];
		if (startingPiece) {
			this.piece.push(startingPiece);
			startingPiece.currHex = OffsetCoord.qoffsetToCube(
				OffsetCoord.ODD,
				new OffsetCoord(this.col - 7, this.row)
			);
		}
		// list of offset for each cell that is a neighbor
		this.neighbors = [];

		const corners = this.hive.layout.polygonCorners(this.hex);
		const pixel = this.hive.layout.hexToPixel(this.hex);

		for (let i = 0; i < corners.length; i++) {
			corners[i].x -= pixel.x;
			corners[i].y -= pixel.y;
		}
		const smallerCorners = shrinkHexagon(corners, 4);

		this.hexagon = this.gameManager.add.polygon(
			pixel.x,
			pixel.y,
			smallerCorners
		);

		this.hexagon
			.setInteractive(
				new Phaser.Geom.Polygon(corners),
				Phaser.Geom.Polygon.Contains
			)
			.setInteractive({ cursor: "pointer" })
			.setFillStyle(this.getCurrentColor())
			.setStrokeStyle(4, this.getCurrentStroke())
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
		for (let i = 0; i < 6; i++) {
			this.neighbors.push(
				OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, this.hex.neighbor(i))
			);
		}
	}

	getNeighborsWithPieces() {
		return this.neighbors
			.filter(
				(nOffset) => this.hive.getCellFromOffset(nOffset).piece.length > 0
			)
			.map((offset) => `${offset.row},${offset.col}`);
	}

	updateUI() {
		this.hexagon.setFillStyle(this.getCurrentColor());
		this.hexagon.setStrokeStyle(4, this.getCurrentStroke());
	}

	// TODO: blend colors
	pointerOver() {
		const piece = this.gameManager.pieceClicked;
		if (piece) {
			this.hexagon.setFillStyle(piece.color);
			this.hexagon.setStrokeStyle(4, piece.borderColor);
		} else {
			// blend hover color with current piece color
			const hoverColor = 0xeeeeee;
			const pieceColor = this.piece.length
				? this.piece[this.piece.length - 1].color
				: 0xdddddd;
			const pieceBorderColor = this.piece.length
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

	// click on hex and it is players turn. What I want to do: if no piece is actively clicked, either make a piece actively clicked
	// or nothing. Else -- check if hex is in active pieces possible moves, then place piece, make active
	// change turn
	pointerDown() {
		if (!this.gameManager.currentTurn) {
			return;
		}
		const pieceToPlace = this.gameManager.pieceClicked;
		if (pieceToPlace && pieceToPlace.legalMove(this.hex, this.hive.data)) {
			pieceToPlace.active = true;
			this.gameManager.makeMove(this.hex);
		} else if (
			!pieceToPlace &&
			this.piece.length &&
			this.piece[this.piece.length - 1].side == this.gameManager.side
		) {
			this.gameManager.pieceClicked = this.piece[this.piece.length - 1];
		}
	}
}

export class Hive {
	constructor(gameManager, hexSize, numRows, numCols) {
		this.gameManager = gameManager;

		this.hexSize = hexSize;
		this.numRows = numRows;
		this.numCols = numCols;

		this.hexagons = this.gameManager.add.container(0, 0);
		const orientation = Layout.flat;
		this.layout = new Layout(
			orientation,
			new Point(this.hexSize, this.hexSize),
			new Point(this.hexSize * 2, this.hexSize * 2)
		);

		this.data = [];

		this.createCells();

		// rotates board for the black side player
		// TODO: Un-hard code this number
		if (this.gameManager.server?.playerIndex === -1) {
			const { width, height } = this.gameManager.scale;
			this.hexagons.x += width;
			this.hexagons.y += height;
			this.hexagons.rotation = Phaser.Math.DegToRad(180);
		}
	}

	createCells() {
		const myPieces = [];
		const opponentPieces = [];
		// TODO to make not both players sides white
		this.createPieces(myPieces, Side.White);
		this.createPieces(opponentPieces, Side.Black);
		for (let row = 0; row < this.numRows + 2; row++) {
			this.data[row] = [];
			if (row === 0) {
				for (let col = 0; col < opponentPieces.length; col++) {
					this.data[row][col] = new Cell(
						this.gameManager,
						this,
						row,
						col + 7,
						opponentPieces[col]
					);
				}
			} else if (row === this.numRows + 1) {
				for (let col = 0; col < myPieces.length; col++) {
					this.data[row][col] = new Cell(
						this.gameManager,
						this,
						row,
						col + 7,
						myPieces[col]
					);
				}
			} else {
				for (let col = 0; col < this.numCols; col++) {
					this.data[row][col] = new Cell(this.gameManager, this, row, col);
				}
			}
		}
	}

	createPieces(pieces, side) {
		for (let i = 0; i < 3; i++) {
			if (i < 1) {
				this.gameManager.queen = new Queen(this, this.gameManager, side);
				pieces.push(this.gameManager.queen);
			}
			if (i < 2) {
				pieces.push(
					new Spider(this, this.gameManager, side),
					new Beetle(this, this.gameManager, side)
				);
			}
			if (i < 3) {
				pieces.push(
					new Grasshopper(this, this.gameManager, side),
					new Ant(this, this.gameManager, side)
				);
			}
		}
	}

	getCellFromHex(hex) {
		const offset = OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, hex);
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
	// nextTurn() {}
}

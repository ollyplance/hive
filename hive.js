import {
	DoubledCoord,
	Hex,
	Layout,
	OffsetCoord,
	Orientation,
	Point,
} from "./js/hexgrid.js";

function shrinkHexagon(corners, size) {
	var hexagonCenterX =
		corners.reduce(function (sum, vertex) {
			return sum + vertex.x;
		}, 0) / corners.length;

	var hexagonCenterY =
		corners.reduce(function (sum, vertex) {
			return sum + vertex.y;
		}, 0) / corners.length;

	return corners.map((vertex) => {
		var dx = vertex.x - hexagonCenterX; // Calculate the difference in X from the center
		var dy = vertex.y - hexagonCenterY; // Calculate the difference in Y from the center
		var length = Math.sqrt(dx * dx + dy * dy); // Calculate the distance from the center
		var scale = (length - size) / length; // 2 pixels smaller on all sides
		var newX = hexagonCenterX + dx * scale;
		var newY = hexagonCenterY + dy * scale;
		return new Phaser.Math.Vector2(newX, newY);
	});
}

export class PiecesLeftUI {
	constructor(gameManager, playerSide, x, y) {
		this.gameManager = gameManager
		this.playerSide = playerSide

		this.piecesLeft = this.gameManager.add.group();
		var orientation = Layout.flat;
		this.piecesLeftLayout = new Layout(
			orientation,
			new Point(30, 30),
			new Point(x, y)
		);

		var index = 0;
		for (var row = 0; row < 6; row++) {
			for (var col = 0; col < 2; col++) {
				if (index < this.playerSide.pieces.length) {
					const hex = OffsetCoord.qoffsetToCube(
						OffsetCoord.ODD,
						new OffsetCoord(col, row)
					);
					let corners = this.piecesLeftLayout.polygonCorners(hex);
					let smallerCorners = shrinkHexagon(corners, 4)

					const hexagonUI = this.gameManager.add.polygon(
						0,
						0,
						smallerCorners
					);

					hexagonUI
						.setData("row", row)
						.setData("col", col)
						.setData("index", index)
						.setInteractive(
							new Phaser.Geom.Polygon(corners),
							Phaser.Geom.Polygon.Contains
						)
						.setFillStyle(this.playerSide.pieces[index].color)
						.setStrokeStyle(
							4,
							this.playerSide.pieces[index].borderColor
						)
						.on("pointerdown", () => {
							var piece =
								this.playerSide.pieces[
									hexagonUI.getData("index")
								];
							if (!piece.currHex) {
								this.playerSide.pieceClicked = piece;
							}
						});
					this.piecesLeft.add(hexagonUI);
				}
				index += 1;
			}
		}
	}

	// Updates the UI after a piece has been played and is marked active.
	updateUI() {
		this.piecesLeft.children.entries.forEach((element) => {
			var piece = this.playerSide.pieces[element.getData("index")];
			if (piece.currHex) {
				element.setFillStyle();
				element.setStrokeStyle();
			}
		});
	}
}

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
			this.hexagon.setFillStyle(0xdddddd, 1);
			this.hexagon.setStrokeStyle(4, 0xdddddd, 1);
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
		if (
			pieceToPlace &&
			(pieceToPlace.legalMove(this.hex, this.hive.data))
		) {
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
				this.data[row][col] = new Cell(this.gameManager, this, row, col);
			}
		}
	}

	

	// TODO: take current player and make pieces available -> else set interactive false and make grey
	nextTurn() {

	}
}

import { Ant, Beetle, Grasshopper, Piece, Queen, Spider } from "./pieces.js";
import {
	DoubledCoord,
	Hex,
	Layout,
	OffsetCoord,
	Orientation,
	Point,
} from "./js/hexgrid.js";

class PiecesLeftUI {
	constructor(hive) {
		this.hive = hive;

		this.piecesLeft = this.hive.scene.add.group();
		var orientation = Layout.flat;
		this.piecesLeftLayout = new Layout(
			orientation,
			new Point(30, 30),
			new Point(700, 400)
		);

		var index = 0;
		for (var row = 0; row < 6; row++) {
			for (var col = 0; col < 2; col++) {
				if (index < this.hive.whitePieces.length) {
					const hex = OffsetCoord.qoffsetToCube(
						OffsetCoord.ODD,
						new OffsetCoord(col, row)
					);
					let corners = this.piecesLeftLayout.polygonCorners(hex);
					const hexagonUI = this.hive.scene.add.polygon(
						0,
						0,
						corners
					);

					hexagonUI
						.setData("row", row)
						.setData("col", col)
						.setData("index", index)
						.setInteractive(
							new Phaser.Geom.Polygon(corners),
							Phaser.Geom.Polygon.Contains
						)
						.setFillStyle(this.hive.whitePieces[index].color)
						.setStrokeStyle(2, 0xffffff)
						.on("pointerdown", () => {
							// When the piece is first clicked when it is a piece on the side.
							// Needs to be played.
							var piece =
								this.hive.whitePieces[
									hexagonUI.getData("index")
								];
							if (!piece.active) {
								this.hive.pieceClicked = piece;
								// // TODO: Can I calculate this once and reuse until new board position
								// // TODO: In the future I can give possible spots - for now, I want to just
								// // get the game working lol....
								// piece.getInitialPlacements(this.hive.data, true).forEach((position) => {
								//     const pos = position.split(",")
								//     this.hive.data[pos[0]][pos[1]].hexagon.setFillStyle(0x4FD3F5)
								// })
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
			var piece = this.hive.whitePieces[element.getData("index")];
			if (piece.currHex) {
				element.setFillStyle(0xffffff);
			}
		});
	}
}

class Cell {
	constructor(hive, row, col) {
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
		var corners = this.hive.layout.polygonCorners(this.hex);
		this.hexagon = this.hive.scene.add.polygon(0, 0, corners);

		this.hexagon
			.setInteractive(
				new Phaser.Geom.Polygon(corners),
				Phaser.Geom.Polygon.Contains
			)
			.setFillStyle(this.getCurrentColor())
			.setStrokeStyle(2, 0x000000, 0.5)
			.on("pointerover", this.pointerOver, this)
			.on("pointerout", this.pointerOut, this)
			.on("pointerdown", this.pointerDown, this);

		this.generateNeighbors();

		this.hive.hexagons.add(this.hexagon);
	}

	getCurrentColor() {
		return this.piece.length
			? this.piece[this.piece.length - 1].color
			: 0xcccccc;
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
    }

	// TODO: blend colors
	pointerOver() {
		let piece = this.hive.pieceClicked;
		if (piece) {
			this.hexagon.setFillStyle(piece.color);
		} else {
			this.hexagon.setFillStyle(0xcccccc, 0.3);
		}
	}

	pointerOut() {
		this.updateUI()
	}

	// click on hex. What I want to do: if no piece is actively clicked, either make a piece actively clicked
	// or nothing. Else -- check if hex is in active pieces possible moves, then place piece, make active
	// change turn
	pointerDown() {
		let pieceToPlace = this.hive.pieceClicked;
		if (pieceToPlace && (this.hive.firstMove || pieceToPlace.legalMove(this.hex, this.hive.data))) {
			this.hive.firstMove = false;
            let prevHex = pieceToPlace.currHex;
            if (prevHex) {
                let prevOffset = OffsetCoord.qoffsetFromCube(
                    OffsetCoord.ODD,
                    prevHex
                );
                let prevCell =
					this.hive.data[prevOffset.row][prevOffset.col];
                if (prevCell) {
                    prevCell.piece.pop();
                    prevCell.updateUI()
                }
            }
			pieceToPlace.currHex = this.hex;
			this.piece.push(this.hive.pieceClicked);
			this.hive.pieceClicked = null;
			this.hive.piecesUI.updateUI();
		} else if (!pieceToPlace) {
			this.hive.pieceClicked = this.piece[this.piece.length-1]
		}
	}

	// // TODO: check for piece already being there if the piece is not active
	// legalPlace() {
	// 	var pieceToPlace = this.hive.pieceClicked;
	// 	let data = this.hive.data;
	// 	for (var i = 0; i < this.neighbors.length; i++) {
	// 		let offset = this.neighbors[i];
	// 		if (
	// 			0 <= offset.row &&
	// 			offset.row < data.length &&
	// 			0 <= offset.col &&
	// 			offset.col < data[0].length
	// 		) {
	// 			// check for color
	// 			if (this.hive.data[offset.row][offset.col].piece.length) {
	// 				return true;
	// 			}
	// 		}
	// 	}
	// 	console.log(
	// 		"You can't place it there! Needs to be by another white piece"
	// 	);
	// 	return false;
	// }
}

export class Hive {
	constructor(scene, hexSize, numRows, numCols) {
		this.scene = scene;

		this.hexSize = hexSize;
		this.numRows = numRows;
		this.numCols = numCols;

		this.firstMove = true;

		// scroll through pieces
		this.pieceClicked = null;
		this.whitePieces = [];
		this.blackPieces = [];

		this.hexagons = this.scene.add.group();
		var orientation = Layout.flat;
		this.layout = new Layout(
			orientation,
			new Point(this.hexSize, this.hexSize),
			new Point(this.hexSize * 2, this.hexSize * 2)
		);

		this.data = [];

		this.createCells();
		this.createPieces();

		this.piecesUI = new PiecesLeftUI(this);
	}

	createCells() {
		for (var row = 0; row < this.numRows; row++) {
			this.data[row] = [];
			for (var col = 0; col < this.numCols; col++) {
				this.data[row][col] = new Cell(this, row, col);
			}
		}
	}

	createPieces() {
		for (var i = 0; i < 3; i++) {
			if (i < 1) {
				this.whitePieces.push(new Queen(this.hive, true));
				this.blackPieces.push(new Queen(this.hive, false));
			}
			if (i < 2) {
				this.whitePieces.push(
					new Spider(this.hive, true),
					new Beetle(this.hive, true)
				);
				this.blackPieces.push(
					new Spider(this.hive, false),
					new Beetle(this.hive, false)
				);
			}
			if (i < 3) {
				this.whitePieces.push(
					new Grasshopper(this.hive, true),
					new Ant(this.hive, true)
				);
				this.blackPieces.push(
					new Grasshopper(this.hive, false),
					new Ant(this.hive, false)
				);
			}
		}
	}
}

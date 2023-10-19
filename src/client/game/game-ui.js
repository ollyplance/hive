import { Layout, OffsetCoord, Point } from "./js/hexgrid.js";
import { blendColors, shrinkHexagon } from "./helper";

import Phaser from "phaser";
import { Side } from "./game-manager";

export class GameUI extends Phaser.Scene {
	constructor() {
		super({ key: "GameUI", active: true });

		const orientation = Layout.flat;
		this.piecesLeftLayout = new Layout(
			orientation,
			new Point(30, 30),
			new Point(0, 0)
		);
	}

	init(data) {
		this.whiteSide = data.whiteSide;
		this.blackSide = data.blackSide;
	}

	preload() {
		// Load game assets
	}

	create() {
		this.whitePieceContainer = this.add.container(85, 740);
		this.blackPieceContainer = this.add.container(435, 740);
		this.whitePieceContainer.rotation = Phaser.Math.DegToRad(270);
		this.blackPieceContainer.rotation = Phaser.Math.DegToRad(270);

		this.createPlayersLeftUI(this.whiteSide, this.whitePieceContainer);
		this.createPlayersLeftUI(this.blackSide, this.blackPieceContainer);

		// initialize the white side as starting (this will always be the case)
		this.updateUI(Side.White);

		this.scene.get("GameManager").events.on("updateUI", (currentSide) => {
			this.updateUI(currentSide);
		});
	}

	createPlayersLeftUI(player, pieceContainer) {
		let index = 0;
		for (let row = 0; row < 6; row++) {
			for (let col = 0; col < 2; col++) {
				if (index < player.pieces.length) {
					const hex = OffsetCoord.qoffsetToCube(
						OffsetCoord.ODD,
						new OffsetCoord(col, row)
					);
					const corners = this.piecesLeftLayout.polygonCorners(hex);
					const smallerCorners = shrinkHexagon(corners, 4);

					const hexagonUI = this.add.polygon(0, 0, smallerCorners);

					hexagonUI
						.setData("row", row)
						.setData("col", col)
						.setData("index", index)
						.setInteractive(
							new Phaser.Geom.Polygon(corners),
							Phaser.Geom.Polygon.Contains
						)
						.setFillStyle(player.pieces[index].color)
						.setStrokeStyle(4, player.pieces[index].borderColor)
						.on("pointerdown", () => {
							const piece = player.pieces[hexagonUI.getData("index")];
							if (!piece.currHex) {
								player.pieceClicked = piece;
							}
						});
					pieceContainer.add(hexagonUI);
				}
				index += 1;
			}
		}
	}

	// Updates the UI after a piece has been played and is marked active.
	updateUI(side) {
		function updateUIHelper(player, pieceContainer, side) {
			pieceContainer.list.forEach((element) => {
				const piece = player.pieces[element.getData("index")];
				if (piece.currHex) {
					element.setFillStyle();
					element.setStrokeStyle();
				} else if (side === player.side) {
					element
						.setFillStyle(piece.color)
						.setStrokeStyle(4, piece.borderColor);
				} else {
					element
						.setFillStyle(blendColors(piece.color, 0x333333))
						.setStrokeStyle(4, blendColors(piece.borderColor, 0x333333));
				}
			});
		}

		updateUIHelper(this.whiteSide, this.whitePieceContainer, side);
		updateUIHelper(this.blackSide, this.blackPieceContainer, side);
	}
}

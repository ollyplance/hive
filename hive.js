import {Ant, Beetle, Grasshopper, Piece, Queen, Spider} from './pieces.js'
import {
    DoubledCoord,
    Hex,
    Layout,
    OffsetCoord,
    Orientation,
    Point,
} from './js/hexgrid.js';

class PieceLeftUI {
    constructor(ui, row, col, index) {
        this.ui = ui
        this.row = row
        this.col = col
        this.index = index
        this.hex = OffsetCoord.qoffsetToCube(OffsetCoord.ODD, new OffsetCoord(this.col, this.row));
        let corners = this.ui.piecesLeftLayout.polygonCorners(this.hex);
        this.hexagonUI = this.ui.scene.add.polygon(0, 0, corners);

        this.hexagonUI
            .setInteractive(new Phaser.Geom.Polygon(corners),
                                Phaser.Geom.Polygon.Contains)
            .setFillStyle(this.ui.hive.whitePieces[this.index].color)
            .setStrokeStyle(2, 0xFFFFFF)
            .on('pointerdown', () => {
                var piece = this.ui.hive.whitePieces[this.index]
                if (!piece.active) {
                    this.ui.hive.pieceClicked = piece
                }
            })
            
        this.ui.piecesLeft.add(this.hexagonUI);
    }

    updateUI() {
        var piece = this.ui.hive.whitePieces[this.index]
        if (piece.active) {
            this.hexagonUI.setFillStyle(0xFFFFFF)
        }
    }
}

class PiecesLeftUI {
    constructor(scene, hive)
    {
        this.scene = scene
        this.hive = hive

        this.data = []

        this.piecesLeft = this.scene.add.group();
        var orientation = Layout.flat;
        this.piecesLeftLayout = new Layout(orientation, new Point(30, 30), new Point(700, 400));

        var i = 0
        for (var row = 0; row < 6; row++) {
            for (var col = 0; col < 2; col++) {
                if (i < this.hive.whitePieces.length) {
                    this.data[i] = new PieceLeftUI(this, row, col, i)
                }
                i += 1
            }
        }
    }
}

class Cell {
    constructor(hive, row, col) 
    {
        this.hive = hive
        this.row = row
        this.col = col

        // stack for bugs
        this.piece = []
        this.neighbors = []

        this.hex = OffsetCoord.qoffsetToCube(OffsetCoord.ODD, new OffsetCoord(this.col, this.row));
        var corners = this.hive.layout.polygonCorners(this.hex);
        this.hexagon = this.hive.scene.add.polygon(0, 0, corners);

        this.hexagon
            .setInteractive(new Phaser.Geom.Polygon(corners),
                                Phaser.Geom.Polygon.Contains)
            .setFillStyle(this.getCurrentColor())
            .setStrokeStyle(2, 0x000000, .5)
            .on('pointerover', this.pointerOver, this)
            .on('pointerout', this.pointerOut, this)
            .on('pointerdown', this.pointerDown, this);

        this.generateNeighbors()

        this.hive.hexagons.add(this.hexagon);
    }

    getCurrentColor()
    {
        return this.piece.length ? this.piece[this.piece.length-1].color : 0xCCCCCC
    }

    generateNeighbors()
    {
        for (var i = 0; i < 6; i++)
        {
            this.neighbors.push(OffsetCoord.qoffsetFromCube(OffsetCoord.ODD, this.hex.neighbor(i)))
        }
    }

    pointerOver()
    {
        let piece = this.hive.pieceClicked
        if (piece) {
            this.hexagon.setFillStyle(piece.color);
        } else {
            this.hexagon.setFillStyle(0xCCCCCC, .3);
        }
    }

    pointerOut()
    {
        this.hexagon.setFillStyle(this.getCurrentColor());
    }

    // click on hex. What I want to do: if no piece is actively clicked, either make a piece actively clicked
    // or nothing. Else -- check if hex is in active pieces possible moves, then place peice, make active
    // change turn
    pointerDown()
    {
        let pieceToPlace = this.hive.pieceClicked
        if (pieceToPlace && (pieceToPlace.legalPlace(this.hex))) {
            this.hive.firstMove = false
            this.hive.pieceClicked.active = true
            this.piece.push(this.hive.pieceClicked)
            this.hive.pieceClicked = null
            this.hive.piecesUI.data.forEach((piece) => {
                piece.updateUI();
            })
        }
    }

    // legalPlace() {
    //     let data = this.hive.data;
    //     for (var i = 0; i < this.neighbors.length; i++) {
    //         let offset = this.neighbors[i]
    //         if (0 <= offset.row && offset.row < data.length && 0 <= offset.col && offset.col < data[0].length) {
    //             console.log(this.hive.data[offset.row][offset.col].hexagon.piece)
    //             if (this.hive.data[offset.row][offset.col].piece.length) {
    //                 return true
    //             }
    //         }
    //     }
    //     console.log("You can't place it there! Needs to be by another white piece")
    //     return false
    // }
}

export class Hive
{
    constructor (scene, hexSize, numRows, numCols)
    {
        this.scene = scene;

        this.hexSize = hexSize;
        this.numRows = numRows;
        this.numCols = numCols;

        this.firstMove = true

        // scroll through pieces
        this.pieceClicked = null
        this.whitePieces = []
        this.blackPieces = []

        this.hexagons = this.scene.add.group();
        var orientation = Layout.flat;
        this.layout = new Layout(orientation, new Point(this.hexSize, this.hexSize), new Point(this.hexSize*2, this.hexSize*2));

        this.data = [];

        this.createCells()
        this.createPieces()

        this.piecesUI = new PiecesLeftUI(this.scene, this)
    }

    createCells()
    {
        for (var row = 0; row < this.numRows; row++) {
            this.data[row] = []
            for (var col = 0; col < this.numCols; col++) {
                this.data[row][col] = new Cell(this, row, col)
            }
        }
    }

    createPieces() 
    {
        for (var i = 0; i < 3; i++)
        {
            if (i < 1) {
                this.whitePieces.push(new Queen(this.hive, true))
                this.blackPieces.push(new Queen(this.hive, false))
            }
            if (i < 2) {
                this.whitePieces.push(new Spider(this.hive, true), new Beetle(this.hive, true))
                this.blackPieces.push(new Spider(this.hive, false), new Beetle(this.hive, false))
            }
            if (i < 3) {
                this.whitePieces.push(new Grasshopper(this.hive, true), new Ant(this.hive, true))
                this.blackPieces.push(new Grasshopper(this.hive, false), new Ant(this.hive, false))
            }
        }
    }
}
import {Ant, Beetle, Grasshopper, Piece, Queen, Spider} from './pieces.js'
import {
    DoubledCoord,
    Hex,
    Layout,
    OffsetCoord,
    Orientation,
    Point,
} from './js/hexgrid.js';

class PiecesUI {
    constructor(scene, hive)
    {

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
        let index = this.hive.pieceActive
        if (0 <= index && index < this.hive.whitePieces.length) {
            this.hexagon.setFillStyle(this.hive.whitePieces[index].color);
        } else {
            this.hexagon.setFillStyle(0xCCCCCC, .3);
        }
        // let data = this.hive.data;
        // this.neighbors.forEach((offset) => {
        //     if (0 <= offset.row && offset.row < data.length && 0 <= offset.col && offset.col < data[0].length) {
        //         this.hive.data[offset.row][offset.col].hexagon.setFillStyle(0xFBF2B3);
        //     }
        // })
    }

    pointerOut()
    {
        this.hexagon.setFillStyle(this.getCurrentColor());
    }

    // click
    pointerDown()
    {
        let index = this.hive.pieceActive
        if (0 <= index && index < this.hive.whitePieces.length && (this.hive.firstMove || this.legalPlace())) {
            this.hive.firstMove = false
            let deleted = this.hive.whitePieces.splice(index, 1)[0]
            this.piece.push(deleted)
            this.hive.pieceActive = this.hive.pieceActive ? this.hive.pieceActive - 1 : this.hive.whitePieces.length-1
        }
    }

    legalPlace() {
        let data = this.hive.data;
        for (var i = 0; i < this.neighbors.length; i++) {
            let offset = this.neighbors[i]
            if (0 <= offset.row && offset.row < data.length && 0 <= offset.col && offset.col < data[0].length) {
                console.log(this.hive.data[offset.row][offset.col].hexagon.piece)
                if (this.hive.data[offset.row][offset.col].piece.length) {
                    return true
                }
            }
        }
        console.log("You can't place it there! Needs to be by another white piece")
        return false
    }
}

export class Hive
{
    constructor (scene, hexSize, numRows, numCols)
    {
        this.scene = scene;

        this.hexSize = hexSize;
        this.numRows = numRows;
        this.numCols = numCols;

        // scroll through pieces
        this.pieceActive = 0

        this.firstMove = true

        this.whitePieces = []
        this.blackPieces = []

        this.hexagons = this.scene.add.group();
        var orientation = Layout.flat;
        this.layout = new Layout(orientation, new Point(this.hexSize, this.hexSize), new Point(this.hexSize*2, this.hexSize*2));

        this.data = [];

        this.createCells()
        this.createPieces()
        this.piecesUI = new PiecesUI(this.scene, this)

        this.scene.input.on('wheel', this.wheelScrolled, this);
    }

    wheelScrolled(pointer, gameObjects, deltaX, deltaY, deltaZ) {
        if (deltaY > 0) {
            this.pieceActive = (this.pieceActive + 1) % this.whitePieces.length
        }
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
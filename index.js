import {
    DoubledCoord,
    Hex,
    Layout,
    OffsetCoord,
    Orientation,
    Point,
} from './js/hexgrid.js';

class playGame extends Phaser.Scene {
    constructor() {
        super();
    }

    preload() {
        // Load assets
    }

    create() {
        let { width, height } = this.sys.game.canvas;
        var hexagons = this.add.container();
        var hexSize = 30;
        const numRows = 28;
        const numCols = 28;

        var cam = this.cameras.main;
        
        this.input.mousePointer.motionFactor = 0.5;
        this.input.pointer1.motionFactor = 0.5;

        var orientation = Layout.flat;
        var layout = new Layout(orientation, new Point(hexSize, hexSize), new Point(hexSize*2, hexSize*2));
        this.cursors = this.input.keyboard.createCursorKeys();


        for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numCols; col++) {
                var cube = OffsetCoord.qoffsetToCube(OffsetCoord.ODD, new OffsetCoord(row, col));
                var corners = layout.polygonCorners(cube);
                const hexagon = this.add.polygon(0, 0, corners);

                hexagon
                    .setData('row', row)
                    .setData('col', col)
                    .setInteractive(new Phaser.Geom.Polygon(corners),
                                        Phaser.Geom.Polygon.Contains)
                    .setStrokeStyle(2, 0xFF80BF, .5)
                    .on('pointerover', () => {
                        hexagon.setFillStyle(0xCC99FF, .5);
                    })
                    .on('pointerout', () => {
                        hexagon.setFillStyle(0xCCCCCC);
                    })
                    .on('pointerdown', function () {
                        const hexRow = hexagon.getData('row');
                        const hexCol = hexagon.getData('col');
                        console.log(`Clicked Hexagon at Row: ${hexRow}, Col: ${hexCol}`);
                    });

                hexagons.add(hexagon);
            }
        }
        console.log(hexagons)
        cam.setBounds(0, 0, hexSize * 2 * (numCols-1), hexSize * 2 * (numRows-1));
        cam.setViewport(0, 0, 720, 720);
        cam.centerOn((numCols * hexSize)/2, (numRows * hexSize)/2)
        cam.setZoom(1);

        // help from https://codepen.io/samme/pen/XWJxgRG
        this.input.on("pointermove", function (p) {
            if (!p.isDown) return;

            const { x, y } = p.velocity;

            cam.scrollX -= x / cam.zoom;
            cam.scrollY -= y / cam.zoom;
        });
    }

    update() {
        const cam = this.cameras.main;

        if (this.cursors.left.isDown)
        {
            cam.scrollX -= 4;
            console.log(cam)
        }
        else if (this.cursors.right.isDown)
        {
            cam.scrollX += 4;
        }

        if (this.cursors.up.isDown)
        {
            cam.scrollY -= 4;
        }
        else if (this.cursors.down.isDown)
        {
            cam.scrollY += 4;
        }
    }
}

let gameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: 0xFFFFFF,
    scale: {
        autoCenter: Phaser.Scale.CENTER_BOTH,
        parent: "canvas-container",
    },
    scene: playGame,
};

var game = new Phaser.Game(gameConfig);

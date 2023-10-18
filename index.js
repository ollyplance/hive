import { GameManager } from "./game-manager.js";
import { GameUI } from "./game-ui.js";

let gameConfig = {
	type: Phaser.AUTO,
	width: 780,
	height: 800,
	backgroundColor: 0xffffff,
	scale: {
		// autoCenter: Phaser.Scale.CENTER_BOTH,
		parent: "canvas-container",
	},
	scene: [GameManager, GameUI],
};

var game = new Phaser.Game(gameConfig);

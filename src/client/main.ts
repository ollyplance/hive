import 'regenerator-runtime/runtime'

import Bootstrap from "./game/bootstap";
import { GameManager } from "./game/game-manager.js";
import Phaser from 'phaser'

const config = {
	type: Phaser.AUTO,
	width: 765,
	height: 760,
	backgroundColor: 0xffffff,
	scene: [Bootstrap, GameManager],
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
		parent: "canvas-container",
	}
};

export default new Phaser.Game(config)
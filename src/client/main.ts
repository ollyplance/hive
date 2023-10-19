import 'regenerator-runtime/runtime'

import { GameManager } from "./game/game-manager.js";
import { GameUI } from "./game/game-ui.js";
import Phaser from 'phaser'

const config = {
	type: Phaser.AUTO,
	width: 780,
	height: 800,
	backgroundColor: 0xffffff,
	scene: [GameManager, GameUI],
};

export default new Phaser.Game(config)
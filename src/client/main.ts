import 'regenerator-runtime/runtime'

import Bootstrap from "./game/bootstap";
import { GameManager } from "./game/game-manager.js";
import Phaser from 'phaser'

const config = {
	type: Phaser.AUTO,
	width: 780,
	height: 800,
	backgroundColor: 0xffffff,
	scene: [Bootstrap, GameManager],
};

export default new Phaser.Game(config)
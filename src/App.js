import "./App.css";

import React, { useEffect, useRef, useState } from "react";

import { GameManager } from "./game/game-manager";
import { GameUI } from "./game/game-ui";
import { IonPhaser } from "@ion-phaser/react";
import Phaser from "phaser";

let gameConfig = {
	type: Phaser.AUTO,
	width: 780,
	height: 800,
	backgroundColor: 0xffffff,
	scene: [GameManager, GameUI],
};

function App() {
	const gameRef = useRef(null);
	const [game, setGame] = useState();
	const [initialize, setInitialize] = useState(false);

	const destroy = () => {
		gameRef.current?.destroy();
		setInitialize(false);
		setGame(undefined);
	};

	useEffect(() => {
		if (initialize) {
			setGame(Object.assign({}, gameConfig));
		}
	}, [initialize]);

	return (
		<div className="app">
			<header className="app-header">
				{initialize ? (
					<>
						<IonPhaser
							ref={gameRef}
							game={game}
							initialize={initialize}
						/>
						<div onClick={destroy} className="flex destroyButton">
							<a href="#1" className="bttn">
								Destroy
							</a>
						</div>
					</>
				) : (
					<>
						<div
							onClick={() => setInitialize(true)}
							className="flex"
						>
							<a href="#1" className="bttn">
								Start new game :)
							</a>
						</div>
					</>
				)}
			</header>
		</div>
	);
}

export default App;

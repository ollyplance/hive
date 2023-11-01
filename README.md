# Hive

> Multiplayer socket game based off of the board game: [Hive (game)](<https://en.wikipedia.org/wiki/Hive_(game)>)

![License](https://img.shields.io/badge/license-MIT-green)

## Overview

This was an experimentation project to learn Phaser game development, code up an online version of a board game I love playing with friends, and implement some algorithms into move checking.

Some expansive features I would like to add at some point:

- multiple rooms for many different games
- finalize end game
- randomize white and black player
- add in animations and piece graphics
- start screen -- better web UI
- show possible moves to player who has them turned on
- some mobile support
- change js to ts

Used colyseus and found an example repo that helped with implemented that: https://github.com/ourcade/tic-tac-toe-multiplayer-starter/blob/master/readme.md

## Getting Started

Clone the repository and run:

```
npm install

# start the colyseus socket server
npm run start-server

# start the phaser game
npm run start
```

Open two tabs in your browser. The first tab open will be Player 1.

## License

[MIT License](https://github.com/ourcade/phaser3-typescript-parcel-template/blob/master/LICENSE)

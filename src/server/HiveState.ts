import { ArraySchema, Schema, type } from '@colyseus/schema'

export enum GameState
{
	WaitingForPlayers,
	Playing,
	Finished
}

export class Position extends Schema {
    @type('number') row: number

	@type('number') col: number

    constructor(row: number, col: number)
	{
		super()

		this.row = row
        this.col = col
	}
}

export class Move extends Schema {
    @type('number') player: number;

    @type(Position) from: Position;

    @type(Position) to: Position

    constructor(player: number, from: Position, to: Position)
	{
		super()
        this.player = player
		this.from = from
        this.to = to
	}
}

export default class HiveState extends Schema
{
	@type('number') gameState = GameState.WaitingForPlayers

	@type(Move) lastMove: Move | undefined = undefined

	@type('number') activePlayer = 0

	@type('number') winningPlayer = -1

	constructor()
	{
		super()
	}
}
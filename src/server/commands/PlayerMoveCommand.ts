import HiveState, { GameState, Move, Position } from '../HiveState'

import { Client } from 'colyseus'
import { Command } from '@colyseus/command'
import NextTurnCommand from './NextTurnCommand'

type Payload = {
	client: Client
	fromPosition: Position
	toPosition: Position
}

export default class PlayerMoveCommand extends Command<HiveState, Payload>
{
	execute(data: Payload)
	{
		const { client, fromPosition, toPosition } = data

		if (this.room.state.gameState !== GameState.Playing)
		{
			return
		}

		const clientIndex = this.room.clients.findIndex(c => c.id === client.id)
		if (clientIndex !== this.room.state.activePlayer)
		{
			return
		}

		console.log(fromPosition, toPosition)

		const from = new Position(fromPosition.row, fromPosition.col)
		const to = new Position(toPosition.row, toPosition.col)
		const move = new Move(clientIndex, from, to)
		this.room.state.lastMove = move

		return [
			new NextTurnCommand()
		]
	}
}
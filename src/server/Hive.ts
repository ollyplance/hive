import { Client, Room } from 'colyseus'
import HiveState, { GameState, Position } from './HiveState'

import { Dispatcher } from '@colyseus/command'
import { Message } from '../types/messages'
import PlayerMoveCommand from './commands/PlayerMoveCommand'

export default class Hive extends Room<HiveState>
{
	private dispatcher = new Dispatcher(this)

	onCreate()
	{
		this.maxClients = 2
		this.setState(new HiveState())

		this.onMessage(Message.PlayerSelection, (client, message: { from: Position, to: Position }) => {
			this.dispatcher.dispatch(new PlayerMoveCommand(), {
				client,
				fromPosition: message.from,
				toPosition: message.to
			})
		})
	}

	onJoin(client: Client)
	{
		console.log(this.clients.length)
		const idx = this.clients.findIndex(c => c.sessionId === client.sessionId)
		console.log(idx)
		client.send(Message.PlayerIndex, { playerIndex: idx })

		if (this.clients.length >= 2)
		{
			this.state.gameState = GameState.Playing
			this.lock()
		}
	}
	
}
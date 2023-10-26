import { Client, Room } from 'colyseus.js'
import { GameState, Move, Position } from '../../server/HiveState'

import { Message } from '../../types/messages'
import Phaser from 'phaser'

export default class Server
{
	private client: Client
	private events: Phaser.Events.EventEmitter

	private room?: Room
	private _playerIndex = -1

	get playerIndex()
	{
		return this._playerIndex
	}

	get gameState()
	{
		if (!this.room)
		{
			return GameState.WaitingForPlayers
		}

		return this.room?.state.gameState
	}

	constructor()
	{
		this.client = new Client('ws://localhost:2567')
		this.events = new Phaser.Events.EventEmitter()
	}

	async join()
	{
		this.room = await this.client.joinOrCreate('hive')

		this.room.onMessage(Message.PlayerIndex, (message: { playerIndex: number }) => {
			this._playerIndex = message.playerIndex
		})

		this.room.onStateChange.once(state => {
			this.events.emit('once-state-changed', state)
		})

		this.room.state.onChange = (changes) => {
			changes.forEach(change => {
				const { field, value } = change
				switch (field)
				{
					case 'lastMove':
						this.events.emit('new-move', value)
						break

					case 'activePlayer':
						this.events.emit('player-turn-changed', value)
						break

					case 'winningPlayer':
						this.events.emit('player-win', value)
						break

					case 'gameState':
						this.events.emit('game-state-changed', value)
						break
				}
			})
		}
	}

	leave()
	{
		this.room?.leave()
		this.events.removeAllListeners()
	}

	makeSelection(fromRow: number, fromCol: number, toRow: number, toCol: number)
	{
		if (!this.room)
		{
			return
		}

		if (this.room.state.gameState !== GameState.Playing)
		{
			return
		}

		if (this.playerIndex !== this.room.state.activePlayer)
		{
			console.warn('not this player\'s turn')
			return
		}

		const from = new Position(fromRow, fromCol)
		const to = new Position(toRow, toCol)

		this.room.send(Message.PlayerSelection, { from: from, to: to })
	}

	onceStateChanged(cb: (state: any) => void, context?: any)
	{
		this.events.once('once-state-changed', cb, context)
	}

	onNewMove(cb: (newMove: Move, index: number) => void, context?: any)
	{
		this.events.on('new-move', cb, context)
	}

	onPlayerTurnChanged(cb: (playerIndex: number) => void, context?: any)
	{
		this.events.on('player-turn-changed', cb, context)
	}

	onPlayerWon(cb: (playerIndex: number) => void, context?: any)
	{
		this.events.on('player-win', cb, context)
	}

	onGameStateChanged(cb: (state: GameState) => void, context?: any)
	{
		this.events.on('game-state-changed', cb, context)
	}
}
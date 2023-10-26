import { Command } from '@colyseus/command'
import HiveState from '../HiveState'

export default class NextTurnCommand extends Command<HiveState>
{
	execute()
	{
		const activePlayer = this.room.state.activePlayer

		if (activePlayer === 0)
		{
			this.room.state.activePlayer = 1
		}
		else
		{
			this.room.state.activePlayer = 0
		}
	}
}
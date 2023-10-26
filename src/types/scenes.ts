import type Server from '../client/services/Server'

export interface GameOverSceneDataInt
{
	winner: boolean
	onRestart?: () => void
}

export interface GameSceneDataInt
{
	server: Server
	onGameOver: (data: GameOverSceneDataInt) => void
}
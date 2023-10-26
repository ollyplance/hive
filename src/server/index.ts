import Hive from './Hive'
import { Server } from 'colyseus'
import cors from 'cors'
import express from 'express'
import http from 'http'
import { monitor } from '@colyseus/monitor'

const port = Number(process.env.PORT || 2567)
const app = express()

app.use(cors())
app.use(express.json())

const server = http.createServer(app)
const gameServer = new Server({
	server,
})

// register your room handlers
gameServer.define('hive', Hive)

// register colyseus monitor AFTER registering your room handlers
app.use('/colyseus', monitor())

gameServer.listen(port)
console.log(`Listening on ws://localhost:${port}`)
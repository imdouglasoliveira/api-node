import { startServer } from './app.ts'

const server = await startServer()

server.listen({ port: 3333 }).then(() => {
    console.log('Server is running on port 3333')
})
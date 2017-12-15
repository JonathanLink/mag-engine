'use strict';
const Hapi = require('hapi')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const app = require('./src/api/models/app.js')
const util = require('util')
const exec = util.promisify(require('child_process').exec)


const server = Hapi.Server({ 
    host: '0.0.0.0', 
    port: 8000,
    routes: {cors: {origin: ['http://localhost:5555'] }}
})


async function openDatabaseConnection(databaseURL) {
    mongoose.Promise = global.Promise
    try {
        return await mongoose.connect(databaseURL, { useMongoClient: true })
    } catch (err) {
        console.log(err)
    }
}

let brickRoutes

async function main() {

    server.route({
        method: 'POST',
        path:'/app', 
        handler: async (request, h) => {
            await app.create(JSON.parse(request.payload))
            return h.response().created()
        }
    })

    server.route({
        method: 'GET',
        path:'/list/app', 
        handler: async (request, h) => {
            console.log(request.payload)
            let list = await app.find({})
            console.log(list)
            return list
        }
    })

    server.route({
        method: 'PUT',
        path:'/start/{appId}', 
        handler: async (request, h) => {
            console.log('app ' + request.params.appId + " will start")
            
            async function startBrickService() {
                try {
                    const { stdout, stderr } = await exec('cd bricks && docker-compose up -d')
                    console.log('stdout:', stdout)
                    console.log('stderr:', stderr)
                    return stdout
                } catch (e) {
                    console.log(e)
                }
            }
            let stdout = await startBrickService()

            return h.response().created()
        }
    })

    server.route({
        method: 'PUT',
        path:'/pause/{appId}', 
        handler: (request, h) => {
            console.log(request.payload)
            // save app in mongodb
            return h.response().created()
        }
    })

    server.route({
        method: 'DELETE',
        path:'/app/{appId}', 
        handler: (request, h) => {
            console.log(request.payload)
            // save app in mongodb
            return h.response().created()
        }
    })

    // Create a server with a host and port
    try {
        await server.start()
        console.log('mag-engine server running at:', server.info.uri)
    } catch(err) {
        console.log(err)
    }
    

    // Open connection to mongo database
    const databaseURL = 'mongodb://mongo/mag-engine'
    await openDatabaseConnection(databaseURL)

}

main()

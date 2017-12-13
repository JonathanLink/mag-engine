'use strict';
const Hapi = require('hapi')
const mongoose = require('mongoose')

const server = Hapi.Server({ 
    host: '0.0.0.0', 
    port: 8000,
    routes: {cors: {origin: ['http://localhost:7000', 'http://localhost:5555'] }}
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
        handler: (request, h) => {
            console.log(request.payload)
            // save app in mongodb
            return h.response().created()
        }
    })

    server.route({
        method: 'GET',
        path:'/list/app', 
        handler: (request, h) => {
            console.log(request.payload)
            // get apps from mongodb
            return 'app1, app2'
        }
    })

    server.route({
        method: 'PUT',
        path:'/start/{appId}', 
        handler: (request, h) => {
            console.log(request.payload)
            // save app in mongodb
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

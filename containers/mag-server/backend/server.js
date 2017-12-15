'use strict';
const Hapi = require('hapi')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const util = require('util')
const exec = util.promisify(require('child_process').exec)


const server = Hapi.Server({ 
    host: '0.0.0.0', 
    port: 8000,
    routes: {cors: {origin: ['http://localhost:11000'] }}
})


async function openDatabaseConnection(databaseURL) {
    mongoose.Promise = global.Promise
    try {
        return await mongoose.connect(databaseURL, { useMongoClient: true })
    } catch (err) {
        console.log(err)
    }
}

server.route({
    method: 'GET',
    path:'/',
    handler: (request, h) => {
        return 'hello world'
    }
})


// Start the server
async function start() {
    try {
        await server.start()
    }
    catch (err) {
        console.log(err)
        process.exit(1)
    }
     // Open connection to mongo database
    const databaseURL = 'mongodb://mongo/mag-server'
    await openDatabaseConnection(databaseURL)
    console.log('Server running at:', server.info.uri)
}

start()

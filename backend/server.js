'use strict';
const Hapi = require('hapi')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise
const appModel = require('./src/api/models/app.js')
const Boom = require('boom')
const util = require('util')
const exec = util.promisify(require('child_process').exec)
const fs = require('fs')
const Promise = require('bluebird')
Promise.promisifyAll(fs);

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
            await appModel.create(JSON.parse(request.payload))
            return h.response().created()
        }
    })

    server.route({
        method: 'GET',
        path:'/list/app', 
        handler: async (request, h) => {
            console.log(request.payload)
            let list = await appModel.find({})
            console.log(list)
            return list
        }
    })

    server.route({
        method: 'PUT',
        path:'/start/{appId}', 
        handler: async (request, h) => {

            // 0. Get parameters
            const appId = request.params.appId
            let app
            try {
                app = await appModel.findOne( { _id: appId } )
            } catch (e) {
                console.log(e)
                return Boom.badImplementation('internal error: cannot start app (step 0)')
            } 


            // 1. Create a new folder for the app
            try {
                await fs.mkdirAsync(__dirname + '/apps/' + app.appName)
            } catch (e) {
                console.log(e)
                return Boom.badImplementation('internal error: cannot start app (step 1)')
            } 
       

            
            // 2. Export app config in a json file and save it in the folder


            // 3. docker-compose up


            // 4. inside the new container: git clone bricks inside volume


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
            await startBrickService()
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

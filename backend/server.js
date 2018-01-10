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
            console.log(JSON.parse(request.payload))
            try {
                await appModel.create(JSON.parse(request.payload))
            } catch (e) {
                console.log(e)
            }
            return h.response().created()
        }
    })

    server.route({
        method: 'GET',
        path:'/list/app', 
        handler: async (request, h) => {
            console.log(request.payload)
            let list = await appModel.find({})
            console.log(JSON.stringify(list))
            return JSON.stringify(list)
        }
    })

    server.route({
        method: 'PUT',
        path:'/state/{appId}/{state}', 
        handler: async (request, h) => {
            const appId = request.params.appId
            const state = request.params.state
            try {
                await appModel.update({_id: appId}, {$set: {state: state}})
            } catch (e) {
                console.log(e)
                throw Boom.unsupportedMediaType(e)
            }
            return h.response()
        }
    })

    server.route({
        method: 'PUT',
        path:'/start/{appId}', 
        handler: async (request, h) => {
            const appId = request.params.appId
            let app
            try {
                app = await appModel.findOne( { _id: appId } )
            } catch (e) {
                console.log(e)
                return Boom.badImplementation('internal error: cannot start app (step 0)')
            } 

            async function startWebApp(app) {
                console.log('startWebApp')
                try {
                    let appPath = __dirname + '/apps/' + app.appName
                    const { stdout, stderr } = await exec(`cd ${appPath} && docker-compose start && docker unpause ${app.appName}_nginx_1`)
                    console.log('stdout:', stdout)
                    console.log('stderr:', stderr)
                    return stdout
                } catch (e) {
                    console.log(e)
                    return Boom.badImplementation('internal error: cannot start webapp')
                }
            }

            await startWebApp(app)
            return h.response()
        }
    })

    server.route({
        method: 'PUT',
        path:'/stop/{appId}', 
        handler: async (request, h) => {
            const appId = request.params.appId
            let app
            try {
                app = await appModel.findOne( { _id: appId } )
            } catch (e) {
                console.log(e)
                return Boom.badImplementation('internal error: cannot stop app (step 0)')
            } 

            async function stopWebApp(app) {
                console.log('stopWebApp')
                try {
                    let appPath = __dirname + '/apps/' + app.appName
                    const { stdout, stderr } = await exec(`cd ${appPath} && docker-compose stop && docker pause ${app.appName}_nginx_1`)
                    console.log('stdout:', stdout)
                    console.log('stderr:', stderr)
                    return stdout
                } catch (e) {
                    console.log(e)
                    return Boom.badImplementation('internal error: cannot stop webapp')
                }
            }

            await stopWebApp(app)
            return h.response()
        }
    })

    server.route({
        method: 'PUT',
        path:'/install/{appId}', 
        handler: async (request, h) => {
            

            // 0. Get parameters
            const appId = request.params.appId
            var app
            try {
                app = await appModel.findOne( { _id: appId } )
            } catch (e) {
                console.log(e)
                return Boom.badImplementation('internal error: cannot start app (step 0)')
            } 

            // 2. Copy mag-server files for the new app 
            let appPath = __dirname + '/apps/' + app.appName
            try {
                const magServerPath =  __dirname + '/containers/mag-server'
                await exec(`cp -r ${magServerPath} ${appPath}`)
                //appPath = appPath + '/mag-server'
            } catch (e) {
                console.log(e)
                return Boom.badImplementation('internal error: cannot start app (step 2)')
            }

            // Generate port number of nginx and server container + save it in app object
            const MIN_PORT_NUMBER = 49152
            const MAX_PORT_NUMBER = 65535
            const serverPortNumber = Math.floor(Math.random() * (MAX_PORT_NUMBER - MIN_PORT_NUMBER) ) + MIN_PORT_NUMBER  
            const nginxPortNumber = Math.floor(Math.random() * (MAX_PORT_NUMBER - MIN_PORT_NUMBER) ) + MIN_PORT_NUMBER  

            // 3. Export app config in a json file and save it in the folder
            try {
                await fs.writeFileSync(appPath + '/backend/app.json', JSON.stringify(app) , 'utf-8'); 
            } catch (e) {
                console.log(e)
                return Boom.badImplementation('internal error: cannot start app (step 3)')
            }

            // 4. generate docker-compose.yml for the fresh new mag-server container
            await exec(`rm ${appPath + '/docker-compose.yml'} & cp ${appPath + '/docker-compose.base.yml'} ${appPath + '/docker-compose.yml'}`)
            let placeholder = '@MAG_SERVER_SERVER_PORT@'
            await exec(`sed -i 's#${placeholder}#${serverPortNumber}#g' ${appPath + '/docker-compose.yml'}`)
            placeholder = '@MAG_SERVER_NGINX_PORT@'
            await exec(`sed -i 's#${placeholder}#${nginxPortNumber}#g' ${appPath + '/docker-compose.yml'}`)
            placeholder = '@MAG_ENGINE_BASE_PATH@'
            const magBasePath = process.env.BASE_PATH
            await exec(`sed -i 's#${placeholder}#${magBasePath}#g' ${appPath + '/docker-compose.yml'}`)
            placeholder = '@APP_NAME@'
            await exec(`sed -i 's#${placeholder}#${app.appName}#g' ${appPath + '/docker-compose.yml'}`)
            placeholder = '@SERVER_PORT_NUMBER@'
            await exec(`sed -i 's#${placeholder}#${serverPortNumber}#g' ${appPath + '/docker-compose.yml'}`)
            placeholder = '@NGINX_PORT_NUMBER@'
            await exec(`sed -i 's#${placeholder}#${nginxPortNumber}#g' ${appPath + '/docker-compose.yml'}`)
            placeholder = '@BASE_PATH@'
            await exec(`sed -i 's#${placeholder}#${process.env.BASE_PATH}#g' ${appPath + '/docker-compose.yml'}`)
            
            // 5. docker-compose up
            async function startBrickService() {
                try {
                    const { stdout, stderr } = await exec(`cd ${appPath} && docker-compose down --rmi all -v --remove-orphans && docker-compose build --no-cache && docker-compose  up`) // -p ${app.appName}
                    console.log('stdout:', stdout)
                    console.log('stderr:', stderr)
                    return stdout
                } catch (e) {
                    console.log(e)
                    return Boom.badImplementation('internal error: cannot start app (step 4)')
                }
            }
            await startBrickService()
            return h.response().created(JSON.stringify({port: nginxPortNumber}))
        }
    })

    server.route({
        method: 'DELETE',
        path:'/{appId}', 
        handler: async (request, h) => {
            const appId = request.params.appId
            
            let app
            try {
                app = await appModel.findOne( { _id: appId } )
            } catch (e) {
                console.log(e)
                return Boom.badImplementation()
            }  
            
            async function dockerDownWebApp(app) {
                console.log('stopWebApp')
                try {
                    let appPath = __dirname + '/apps/' + app.appName
                    const { stdout, stderr } = await exec(`cd ${appPath} && docker rm -f ${app.appName}_nginx_1  && docker-compose down --remove-orphans `)
                    console.log('stdout:', stdout)
                    console.log('stderr:', stderr)
                    return stdout
                } catch (e) {
                    console.log(e)
                    return Boom.badImplementation('internal error: cannot stop webapp')
                }
            }

            await dockerDownWebApp(app)
            

            
            // save app in mongodb
            let appPath = __dirname + '/apps/' + app.appName
            try {
                await exec(`docker exec magengine_api_1 rm -rf ${appPath}`)
            } catch(e) {
                console.log(e)
            }
            await appModel.remove( { _id: appId } )
            return h.response()
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

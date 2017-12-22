/*
DO NOT MODIFY THIS FILE
*/

'use strict';
const Hapi = require('hapi')
const mongoose = require('mongoose')

const server = Hapi.Server({ 
    host: '0.0.0.0', 
    port: 8000,
    routes: {cors: {origin: ['http://localhost:8080', 'http://localhost:8081', 'http://localhost:8090', 'http://localhost:8091', 'http://localhost:13000', 'http://localhost:14000'] }}
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

   
    try {
        const routes = Array.from(require('./api/api.js'))
        brickRoutes = routes.map(r => { r.path = '/api/brick/redactor' + r.path; return r; })
        server.route(brickRoutes)
    } catch (err) {
        console.log(err)
    }

    server.route({
        method: 'GET',
        path:'/', 
        handler: (request, h) => {
            let html = `<h2>DEV API FOR BRICK DEVELOPMENT</h2>`
            let apiList = brickRoutes.map(r => `[${r.method}] <a href="${r.path}">${r.path}</a><br>`).join(' ')
            html = html + apiList
            return html
        }
    })
 

    /*server.path('./public/');
    server.route({
        method: 'GET',
        path: '/a',
        handler: (request, h) => {
            return h.file('a.html')
        }
    })*/

     // Create a server with a host and port
    try {
        await server.start()
        console.log('SANDBOXED MAG REST API Server running at:', server.info.uri)
    } catch(err) {
        console.log(err)
    } 

    // Open connection to mongo database
    const databaseURL = 'mongodb://mongo/mag-sandbox'
    await openDatabaseConnection(databaseURL)
    //mongoose.useDb('')


  

}

main()

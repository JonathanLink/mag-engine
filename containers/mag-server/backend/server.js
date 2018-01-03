'use strict';
const Hapi = require('hapi')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const util = require('util')
const exec = util.promisify(require('child_process').exec)
const readFile = util.promisify(require('fs').readFile)

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

async function wait(ms) {
    await new Promise(resolve => setTimeout(() => resolve(), ms));
}

async function init() {
    console.log("init")
    // read app.json
    let app
    try {
        app = await readFile(__dirname + '/app.json', 'utf8')
    } catch(e) {
        console.log(e)
    }

    // for each 
        // brick git clone
        // mv files in app/src
        // mv file in admin/src
        // docker-compose up
    try {    
        app = await JSON.parse(app)
    } catch(e) {
        console.log(e)
    }
    
    console.log(app)

    const brickRepos = {
        "redactor": "/home/node/bricks-repo/prod/redactor"
    }

    let importBrick = ''
    let menuBrick = ""
    let routeBrick = ''
    
    let webpackEntries = ''
    let webpackChunks = ''

    let nginxBrickAPIRoutes = ''

       app.bricks.forEach( async brickName => {
        // brick git clone (npm issue + proxy + .git folder permission issue later when mv)
        /*try {
            const {stdout, stderr} = await exec(`cd tmp && git clone ${brickRepos[brickName]}`)
        } catch(e) {
            console.log(e)
        }*/
        //if (false) { 
        try {
            const {stdout, stderr} = await exec(`cd tmp && cp -r ${brickRepos[brickName]} ${brickName}`)
        } catch(e) {
            console.log(e)
        }
        
        // mv files in app/src
        try {
            const {stdout, stderr} = await exec(`mv tmp/${brickName}/frontend/app/src/brick frontend/app/bricks/${brickName}`)
        } catch(e) {
            console.log(e)
        }

        // mv files in admin/src
        try {
            const {stdout, stderr} = await exec(`mv tmp/${brickName}/frontend/admin/src/brick frontend/admin/bricks/${brickName}`)
        } catch(e) {
            console.log(e)
        }

        // mv brick backend in bricks
        try {
            const {stdout, stderr} = await exec(`mv tmp/${brickName}/backend bricks/${brickName}`)
        } catch(e) {
            console.log(e)
        }

        // generate docker-compose for backend
        let placeholder = "@APP_NAME@"
        await exec(`sed -i 's#${placeholder}#${app.appName}#g' bricks/${brickName}/docker-compose.prod.yml`) 
        placeholder = "@BASE_PATH@"
        await exec(`sed -i 's#${placeholder}#${process.env.BASE_PATH}#g' bricks/${brickName}/docker-compose.prod.yml`)    
    //}
        // generate imports for app/entry/App.jsx
        importBrick =  importBrick + `import ${brickName} from "../bricks/${brickName}/brick.js"\\n`

        let brickInfo
        try {
            brickInfo = await readFile(`frontend/app/app.conf`  , 'utf8')
            brickInfo = await JSON.parse(brickInfo)
            console.log(brickInfo)
        } catch(e) {
            console.log(e)
        }
      
        menuBrick = menuBrick + `<ListItem><Link onClick={this.toggleMenu} to={"${brickInfo.entry}"}>${brickInfo.menuName}</Link></ListItem>\\n`
        routeBrick = routeBrick + `{${brickName}.routes.map((route, index) => <Route key={ index } exact path={ route.path }  render={ (props) => { props.registerBrickView = this.registerBrickView; return React.createElement(route.component, props); } } /> )}`

        // generate webpack (app / admin)
        webpackEntries = webpackEntries + `,redactor: "./bricks/${brickName}/components/${brickInfo.entryComponent}"\\n`
        webpackChunks = webpackChunks + `, "${brickName}"`

        // nginx brick api routes
        nginxBrickAPIRoutes = nginxBrickAPIRoutes + `location /${app.appName.toLowerCase()}/api/brick/${brickName} { \\n\\t\\t rewrite ^/${app.appName.toLowerCase()}(.*)$ $1 break; \\n\\t\\t proxy_pass http://${app.appName.toLowerCase()}_${brickName}_api_1:8000; \\n\\t\\t proxy_http_version 1.1; \\n\\t\\t proxy_set_header Upgrade $http_upgrade; \\n\\t\\t proxy_set_header Connection "upgrade"; \\n\\t\\t proxy_set_header Host $host; \\n\\t\\t proxy_cache_bypass $http_upgrade; \\n\\t}\\n` 

    })

    console.log("wait")
    await wait(8000);
    console.log("ok")
    

    try {

        // generate shell.js
        await exec(`rm frontend/app/entry/shell.js && cp frontend/app/entry/shell.BASE.js frontend/app/entry/shell.js`)
        let placeholder = "//@SW_PATH@"
        let swpath = `./${app.appName.toLowerCase()}/sw.js`
        await exec(`sed -i 's#${placeholder}#${swpath}#g' frontend/app/entry/shell.js`)

        // generate shell/App.js (app / admin)
        await exec(`rm frontend/app/entry/App.jsx && cp frontend/app/entry/AppBASE.jsx frontend/app/entry/App.jsx`)
        
        placeholder = "//@AUTO-GENERATED-IMPORT@"
        await exec(`sed -i 's#${placeholder}#${importBrick}#g' frontend/app/entry/App.jsx`)
        
        placeholder = "//@AUTO-GENERATED-MENU@"
        await exec(`sed -i 's#${placeholder}#${menuBrick}#g' frontend/app/entry/App.jsx`)

        placeholder = "//@AUTO-GENERATED-ROUTE@"
        await exec(`sed -i 's#${placeholder}#${routeBrick}#g' frontend/app/entry/App.jsx`)

        placeholder = "@HOMEPAGE@"
        await exec(`sed -i 's#${placeholder}#${app.appName.toLowerCase()}#g' frontend/app/entry/App.jsx`)
        
        
        // generate webpack (app / admin)
        await exec(`rm frontend/app/webpack.common.js && cp frontend/app/webpack.common.BASE.js frontend/app/webpack.common.js`)
        placeholder = "//@ENTRIES@"
        await exec(`sed -i 's#${placeholder}#${webpackEntries}#g' frontend/app/webpack.common.js`)
        placeholder = "//@PUBLIC_PATH@"
        const publicPath = `"/${app.appName.toLowerCase()}"`
        await exec(`sed -i 's#${placeholder}#${publicPath}#g' frontend/app/webpack.common.js`)
        placeholder = "//@CHUNKS@"
        await exec(`sed -i 's#${placeholder}#${webpackChunks}#g' frontend/app/webpack.common.js`)

        await exec(`rm frontend/app/webpack.prod.js && cp frontend/app/webpack.prod.BASE.js frontend/app/webpack.prod.js`)
        placeholder = "//@SW_PREFIX_URL@"
        let swPrefixURL= '/' + app.appName
        swPrefixURL = swPrefixURL.toLowerCase()
        await exec(`sed -i 's#${placeholder}#${swPrefixURL}#g' frontend/app/webpack.prod.js`)

        // webpack 
        await exec(`cd frontend/app && webpack --config webpack.prod.js`)        
       
        // update nginx route
       
        await exec(`rm nginx/conf.d/default.conf && cp nginx/conf.d/default.base nginx/conf.d/default.conf`)

        placeholder = "@NGINX_APP_SHORT_NAME@"
        let nginAppName= app.appName
        nginAppName = nginAppName.toLowerCase()
        await exec(`sed -i 's#${placeholder}#${nginAppName}#g' nginx/conf.d/default.conf`)

        placeholder = "@SERVER_APP_SERVER_PORT@"
        await exec(`sed -i 's#${placeholder}#${process.env.SERVER_PORT_NUMBER}#g' nginx/conf.d/default.conf`)      
           
        // nginx api bricks
        placeholder = "@NGINX_BRICK_API@"
        await exec(`sed -i 's#${placeholder}#${nginxBrickAPIRoutes}#g' nginx/conf.d/default.conf`)

    } catch(e) {
        console.log(e)
    }

   

    app.bricks.forEach( async brickName => {
            // docker-compose up
            try {
                console.log("DOCKER COMPOSE UP")
                //await exec(`docker exec ${app.appName.toLowerCase()}_nginx_1 nginx -s reload`)
                await exec(`cd bricks/${brickName} && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml -p ${app.appName} up --build -d`)
                await exec(`docker run -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/nginx/conf.d:/etc/nginx/conf.d -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/nginx/nginx.conf:/etc/nginx/nginx.conf -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/frontend/app/dist:/dist -p :80 --link ${app.appName.toLowerCase()}_${brickName}_api_1:${app.appName.toLowerCase()}_${brickName}_api_1 --net  --name ${app.appName.toLowerCase()}_nginx_1 nginx`)
            } catch(e) {
                console.log(e)
            }
        }
    )



    
}


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


init()
//start()

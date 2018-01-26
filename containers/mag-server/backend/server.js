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

    try {    
        app = await JSON.parse(app)
    } catch(e) {
        console.log(e)
    }
    
    console.log(app)

    const brickRepos = {
        "redactor": "/home/node/bricks-repo/prod/redactor",
        "survey": "/home/node/bricks-repo/prod/survey"
    }

   

    async function setup(dir)  {

        let importBrick = ''
        let menuBrick = ""
        let routeBrick = ''
        
        let webpackImportBrickConfig = ''
        let webpackMergeBrickConfig = ''
        let webpackEntries = ''
        let webpackChunks = ''
    
        let nginxBrickAPIRoutes = ''
    
        for (let brickName of app.bricks) {
           
            // brick git clone (npm issue + proxy + .git folder permission issue later when mv)
            /*try {
                const {stdout, stderr} = await exec(`cd tmp && git clone ${brickRepos[brickName]}`)
            } catch(e) {
                console.log(e)
            }*/
            //if (false) { 
            if (dir === 'app') {
                try {
                    const {stdout, stderr} = await exec(`cd tmp && cp -r ${brickRepos[brickName]} ${brickName}`)
                } catch(e) {
                    console.log(e)
                }
            }
            
            // mv files in app/src
            try {
                const {stdout, stderr} = await exec(`mv tmp/${brickName}/frontend/${dir}/src/brick frontend/${dir}/bricks/${brickName}`)
            } catch(e) {
                console.log(e)
            }

            if (dir === 'app') {
                // mv brick backend in bricks
                try {
                    const {stdout, stderr} = await exec(`mv tmp/${brickName}/backend bricks/${brickName}`)
                } catch(e) {
                    console.log(e)
                }

                // generate docker-compose for backend
            
                let placeholder = "@APP_NAME@"
                await exec(`sed -i 's#${placeholder}#${app.appName}#g' bricks/${brickName}/docker-compose.prod.yml`) 
                placeholder = "@BRICK_NAME@"
                await exec(`sed -i 's#${placeholder}#${brickName}#g' bricks/${brickName}/docker-compose.prod.yml`) 
                placeholder = "@BASE_PATH@"
                await exec(`sed -i 's#${placeholder}#${process.env.BASE_PATH}#g' bricks/${brickName}/docker-compose.prod.yml`)
                placeholder = "@APP_NAME_ENV@"
                await exec(`sed -i 's#${placeholder}#${app.appName.toLowerCase()}#g' bricks/${brickName}/docker-compose.prod.yml`)
            }
        //}
            // generate imports for app/entry/App.jsx
            importBrick =  importBrick + `import ${brickName} from "../bricks/${brickName}/routes.js"\\n`

            let brickInfo
            try {
                brickInfo = await readFile(`frontend/${dir}/bricks/${brickName}/brick.conf`  , 'utf8')
                brickInfo = await JSON.parse(brickInfo)
                console.log(brickInfo)
            } catch(e) {
                console.log(e)
            }
        
            menuBrick = menuBrick + `<ListItem><Link onClick={this.toggleMenu} to={"${brickInfo.entry}"}>${brickInfo.menuName}</Link></ListItem>\\n`
            routeBrick = routeBrick + `{${brickName}.routes.map((route, index) => <Route key={ index } exact path={ route.path }  render={ (props) => { props.setBackButton = this.setBackButton; return React.createElement(route.component, props); } } /> )}`

            // webpack import brick config file
            webpackImportBrickConfig = webpackImportBrickConfig + `const ${brickName} = require("./bricks/${brickName}/webpack.brick.js")\\n`
            webpackMergeBrickConfig = webpackMergeBrickConfig + `${brickName},`
            
            // generate webpack (app / admin)
            webpackEntries = webpackEntries + `,${brickName}: "./bricks/${brickName}/components/${brickInfo.entryComponent}"\\n`
            webpackChunks = webpackChunks + `, "${brickName}"`

            // nginx brick api routes
            nginxBrickAPIRoutes = nginxBrickAPIRoutes + `location /api/brick/${brickName} { \\n\\t\\t proxy_pass http://${app.appName.toLowerCase()}_${brickName}_api_1:8000; \\n\\t\\t proxy_http_version 1.1; \\n\\t\\t proxy_set_header Upgrade $http_upgrade; \\n\\t\\t proxy_set_header Connection "upgrade"; \\n\\t\\t proxy_set_header Host $host; \\n\\t\\t proxy_cache_bypass $http_upgrade; \\n\\t}\\n` 

        }

        // step 2
        //try {
        
            // generate shell/App.js (app / admin)
            await exec(`rm -f frontend/${dir}/entry/App.jsx && cp frontend/${dir}/entry/AppBASE.jsx frontend/${dir}/entry/App.jsx`)
            
            let placeholder = "//@AUTO-GENERATED-IMPORT@"
            await exec(`sed -i 's#${placeholder}#${importBrick}#g' frontend/${dir}/entry/App.jsx`)
            
            placeholder = "//@AUTO-GENERATED-MENU@"
            await exec(`sed -i 's#${placeholder}#${menuBrick}#g' frontend/${dir}/entry/App.jsx`)

            placeholder = "//@AUTO-GENERATED-ROUTE@"
            await exec(`sed -i 's#${placeholder}#${routeBrick}#g' frontend/${dir}/entry/App.jsx`)

            placeholder = "@PRIMARY_COLOR@"
            await exec(`sed -i 's/${placeholder}/${app.color}/g' frontend/${dir}/entry/App.jsx`)


            if (dir === 'app') {
                placeholder = "@DEFAULT_BRICK@"
                await exec(`sed -i 's#${placeholder}#${app.bricks[0]}#g' frontend/${dir}/entry/App.jsx`)
            }

            placeholder = "@@APP_NAME@@"
            await exec(`sed -i 's#${placeholder}#${app.name}#g' frontend/${dir}/entry/App.jsx`)

            // Home.js
            placeholder = "@@ENTRY_BRICK@@"
            await exec(`rm -f frontend/${dir}/entry/Home.js && cp frontend/${dir}/entry/Home.BASE.js frontend/${dir}/entry/Home.js`)
            let brickInfo
            try {
                brickInfo = await readFile(`frontend/${dir}/bricks/${ app.bricks[0] }/brick.conf`  , 'utf8')
                brickInfo = await JSON.parse(brickInfo)
                console.log(brickInfo)
            } catch(e) {
                console.log(e)
            }
            await exec(`sed -i 's#${placeholder}#${ brickInfo.entry }#g' frontend/${dir}/entry/Home.js`)

            // index.html
            await exec(`rm -f frontend/${dir}/entry/index.html && cp frontend/${dir}/entry/index.BASE.html frontend/${dir}/entry/index.html`)
            placeholder = "@@APP_SHORT_NAME@@"
            await exec(`sed -i 's#${placeholder}#${app.appName}#g' frontend/${dir}/entry/index.html`)
            placeholder = "@@APP_NAME@@"
            await exec(`sed -i 's#${placeholder}#${app.name}#g' frontend/${dir}/entry/index.html`)
            placeholder = "@@APP_PRIMARY_COLOR@@"
            await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/entry/index.html`)
            
             // style.css
             await exec(`rm -f frontend/${dir}/entry/styles.css && cp frontend/${dir}/entry/styles.base.css frontend/${dir}/entry/styles.css`)
             placeholder = "@@PRIMARY_COLOR@@"
             await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/entry/styles.css`)
            

            // custom.css for each brick
            if (dir === 'app') {
                for (let brickName of app.bricks) {
                    await exec(`rm -f frontend/${dir}/bricks/${brickName}/assets/custom.css && cp frontend/${dir}/bricks/${brickName}/assets/custom.base.css frontend/${dir}/bricks/${brickName}/assets/custom.css`)
                    let placeholder = "@@PRIMARY_COLOR@@"
                    await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/bricks/${brickName}/assets/custom.css`)
                }
            }

            // generate webpack (app / admin)
            await exec(`rm -f frontend/${dir}/webpack.common.js && cp frontend/${dir}/webpack.common.BASE.js frontend/${dir}/webpack.common.js`)
            placeholder = "//@ENTRIES@"
            await exec(`sed -i 's#${placeholder}#${webpackEntries}#g' frontend/${dir}/webpack.common.js`)
            placeholder = "//@CHUNKS@"
            await exec(`sed -i 's#${placeholder}#${webpackChunks}#g' frontend/${dir}/webpack.common.js`)

            placeholder = "@@IMPORT_WEBPACK_BRICK@@"
            await exec(`sed -i 's#${placeholder}#${webpackImportBrickConfig}#g' frontend/${dir}/webpack.common.js`)
            placeholder = "@@BRICK_MERGE_WEBPACK@@"
            await exec(`sed -i 's#${placeholder}#${webpackMergeBrickConfig}#g' frontend/${dir}/webpack.common.js`)

            // webpack 
            try {
                await exec(`cd frontend/${dir} && webpack --config webpack.prod.js`)        
            } catch(e) {
                
            }

            //if (dir === 'app') {
                // add manifest.json to dist folder
                try {
                    console.log("*******dfdfdfddddfdfdfd****************" + dir)
                    await exec(`rm -f frontend/${dir}/dist/manifest.json && cp frontend/${dir}/entry/manifest.base.json frontend/${dir}/dist/manifest.json`)
                    placeholder = "@@APP_SHORT_NAME@@"
                    await exec(`sed -i 's!${placeholder}!${app.appName}!g' frontend/${dir}/dist/manifest.json`)
                    placeholder = "@@APP_NAME@@"
                    await exec(`sed -i 's!${placeholder}!${app.name}!g' frontend/${dir}/dist/manifest.json`)
                    placeholder = "@@APP_COLOR@@"
                    await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/dist/manifest.json`)

                    // add favicon to dist folder 
                    await exec(`rm -f frontend/${dir}/dist/favicon.ico && cp frontend/${dir}/entry/favicon.ico frontend/${dir}/dist/favicon.ico`)
                } catch(e) {
                    console.log(e)
                    console.log("*******434432****************")
                }

           //}

            // update nginx route
            await exec(`rm -f nginx/conf.d/default.conf && cp nginx/conf.d/default.base nginx/conf.d/default.conf`)

            placeholder = "@SERVER_APP_SERVER_PORT@"
            await exec(`sed -i 's#${placeholder}#${process.env.SERVER_PORT_NUMBER}#g' nginx/conf.d/default.conf`)      
            
            // nginx api bricks
            placeholder = "@NGINX_BRICK_API@"
            await exec(`sed -i 's#${placeholder}#${nginxBrickAPIRoutes}#g' nginx/conf.d/default.conf`)

        /*} catch(e) {
            console.log(e)
        }*/

        
    }

    


        
    

   
    async function step3() {
        for (let brickName of app.bricks) {
            try {
                console.log("DOCKER COMPOSE UP " + brickName)
                //await exec(`docker exec ${app.appName.toLowerCase()}_nginx_1 nginx -s reload`)
                await exec(`cd bricks/${brickName} && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml -p ${app.appName} up --build -d`)
            } catch(e) {
                console.log(e)
            }
        }
        // dirty fix: otherwise nginx was launch/ready too early 
        await exec(`docker stop ${app.appName.toLowerCase()}_nginx_1 && docker rm -f ${app.appName.toLowerCase()}_nginx_1 && docker run -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/nginx/conf.d:/etc/nginx/conf.d -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/nginx/nginx.conf:/etc/nginx/nginx.conf -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/frontend/app/dist:/dist -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/nginx/nginx.conf:/etc/nginx/nginx.conf -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/frontend/app/dist:/app/dist -v ${process.env.BASE_PATH}mag/mag-engine/apps/${app.appName}/frontend/admin/dist:/admin/dist -p ${app.port}:80 --link ${app.appName.toLowerCase()}_${brickName}_api_1:${app.appName.toLowerCase()}_${brickName}_api_1 --net ${app.appName.toLowerCase()}_default  --name ${app.appName.toLowerCase()}_nginx_1 nginx`)
    }

    
    await setup('app')
    await setup('admin')
    await step3()



    
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

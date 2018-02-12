'use strict';
const Hapi = require('hapi')
const mongoose = require('mongoose')
mongoose.Promise = global.Promise

const util = require('util')
const exec = util.promisify(require('child_process').exec)
const readFile = util.promisify(require('fs').readFile)
const writeFile = util.promisify(require('fs').writeFile)

const server = Hapi.Server({ 
    host: '0.0.0.0', 
    port: 8000,
    routes: { cors: true }
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
		    console.log("copy file in tmp dir")
		    await exec(`cd tmp && mkdir ${brickName}`)
                    await exec(`cd tmp && cp -r ${brickRepos[brickName]}/backend ${brickName}/backend`)
		    await exec(`cd tmp && cp -r ${brickRepos[brickName]}/frontend ${brickName}/frontend`)
                } catch(e) {
                    console.log(e)
                }
            }
            
            // mv frontend brick files in app/src
            try {
		console.log("move file from tmp into bricks (frontend)")
                const {stdout, stderr} = await exec(`mv tmp/${brickName}/frontend/${dir}/src/brick frontend/${dir}/bricks/${brickName}`)
            } catch(e) {
                console.log(e)
            }

            if (dir === 'app') {
                // mv brick backend in bricks
                try {
		    console.log("move brick into bricks (backend)")
                    const {stdout, stderr} = await exec(`mv tmp/${brickName}/backend bricks/${brickName}`)
                } catch(e) {
                    console.log(e)
                }

                // generate docker-compose for backend
            	console.log("generate docker-compose.prod.yml for the new app")
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
		        console.log("read brick info from brick.json for " + brickName)
                brickInfo = await readFile(`frontend/${dir}/bricks/${brickName}/brick.json`  , 'utf8')
                brickInfo = await JSON.parse(brickInfo)
                console.log(brickInfo)
                brickInfo.basePath =  app.host + '/' + app.appName.toLowerCase()
                console.log(brickInfo)
                await writeFile(`frontend/${dir}/bricks/${brickName}/brick.json`, JSON.stringify(brickInfo)  , 'utf8')
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
            nginxBrickAPIRoutes = nginxBrickAPIRoutes + `location /api/brick/${brickName} { \\nif ($request_method = OPTIONS ) {\\n\\tadd_header "Access-Control-Allow-Methods" "GET, POST, PUT, DELETE, OPTIONS, HEAD";\\n\\tadd_header "Access-Control-Allow-Headers" "Authorization, Origin, X-Requested-With, Content-Type, Accept";\\n\\treturn 204;\\n}\\n\\t\\t proxy_pass http://${app.appName.toLowerCase()}_${brickName}_api_1:8000; \\n\\t\\t proxy_http_version 1.1; \\n\\t\\t proxy_set_header Upgrade $http_upgrade; \\n\\t\\t proxy_set_header Connection "upgrade"; \\n\\t\\t proxy_set_header Host $host; \\n\\t\\t proxy_cache_bypass $http_upgrade; \\n\\t}\\n` 

        }

        // step 2
	console.log("step 2")
        //try {
        	
            // generate shell/App.js (app / admin)
	    console.log("generate shell/App.js for " + dir)
            await exec(`rm -f frontend/${dir}/entry/App.jsx && cp frontend/${dir}/entry/AppBASE.jsx frontend/${dir}/entry/App.jsx`)
            
            let placeholder = "//@AUTO-GENERATED-IMPORT@"
            await exec(`sed -i 's#${placeholder}#${importBrick}#g' frontend/${dir}/entry/App.jsx`)
            
            placeholder = "//@AUTO-GENERATED-MENU@"
            await exec(`sed -i 's#${placeholder}#${menuBrick}#g' frontend/${dir}/entry/App.jsx`)

            placeholder = "//@AUTO-GENERATED-ROUTE@"
            await exec(`sed -i 's#${placeholder}#${routeBrick}#g' frontend/${dir}/entry/App.jsx`)

            placeholder = "@PRIMARY_COLOR@"
            await exec(`sed -i 's/${placeholder}/${app.color}/g' frontend/${dir}/entry/App.jsx`)
            
            placeholder = "@@BASE_PATH@@"
            await exec(`sed -i 's/${placeholder}/${app.appName}/g' frontend/${dir}/entry/App.jsx`)


            if (dir === 'app') {
                placeholder = "@DEFAULT_BRICK@"
                await exec(`sed -i 's#${placeholder}#${app.bricks[0]}#g' frontend/${dir}/entry/App.jsx`)
            }

            placeholder = "@@APP_NAME@@"
            await exec(`sed -i 's#${placeholder}#${app.name}#g' frontend/${dir}/entry/App.jsx`)

            // Home.js
	    console.log("generate Home.js for " + dir)
            placeholder = "@@ENTRY_BRICK@@"
            await exec(`rm -f frontend/${dir}/entry/Home.js && cp frontend/${dir}/entry/Home.BASE.js frontend/${dir}/entry/Home.js`)
            let brickInfo
            try {
                brickInfo = await readFile(`frontend/${dir}/bricks/${ app.bricks[0] }/brick.json`  , 'utf8')
                brickInfo = await JSON.parse(brickInfo)
                console.log(brickInfo)
            } catch(e) {
                console.log(e)
            }
            await exec(`sed -i 's#${placeholder}#${ brickInfo.entry }#g' frontend/${dir}/entry/Home.js`)

            // index.html
	    console.log("generate index.html for " + dir)
            await exec(`rm -f frontend/${dir}/entry/index.html && cp frontend/${dir}/entry/index.BASE.html frontend/${dir}/entry/index.html`)
            placeholder = "@@APP_SHORT_NAME@@"
            await exec(`sed -i 's#${placeholder}#${app.appName}#g' frontend/${dir}/entry/index.html`)
            placeholder = "@@APP_NAME@@"
            await exec(`sed -i 's#${placeholder}#${app.name}#g' frontend/${dir}/entry/index.html`)
            placeholder = "@@APP_PRIMARY_COLOR@@"
            await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/entry/index.html`)
            
             // style.css
	     console.log("generate style.css for " + dir)
             await exec(`rm -f frontend/${dir}/entry/styles.css && cp frontend/${dir}/entry/styles.base.css frontend/${dir}/entry/styles.css`)
             placeholder = "@@PRIMARY_COLOR@@"
             await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/entry/styles.css`)
            

            // custom.css for each brick
	    console.log("generate custom.css for each brick for " + dir)
            if (dir === 'app') {
                for (let brickName of app.bricks) {
                    await exec(`rm -f frontend/${dir}/bricks/${brickName}/assets/custom.css && cp frontend/${dir}/bricks/${brickName}/assets/custom.base.css frontend/${dir}/bricks/${brickName}/assets/custom.css`)
                    let placeholder = "@@PRIMARY_COLOR@@"
                    await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/bricks/${brickName}/assets/custom.css`)
                }
            }

            // generate webpack (app / admin)
	    console.log("genereate webpack.common.js for frontend  " + dir)
            await exec(`rm -f frontend/${dir}/webpack.common.js && cp frontend/${dir}/webpack.common.BASE.js frontend/${dir}/webpack.common.js`)
            placeholder = "//@ENTRIES@"
            await exec(`sed -i 's#${placeholder}#${webpackEntries}#g' frontend/${dir}/webpack.common.js`)
            placeholder = "//@CHUNKS@"
            await exec(`sed -i 's#${placeholder}#${webpackChunks}#g' frontend/${dir}/webpack.common.js`)

            placeholder = "@@IMPORT_WEBPACK_BRICK@@"
            await exec(`sed -i 's#${placeholder}#${webpackImportBrickConfig}#g' frontend/${dir}/webpack.common.js`)
            placeholder = "@@BRICK_MERGE_WEBPACK@@"
            await exec(`sed -i 's#${placeholder}#${webpackMergeBrickConfig}#g' frontend/${dir}/webpack.common.js`)
            placeholder = "@@BASE_PATH@@"
            await exec(`sed -i 's#${placeholder}#${app.appName.toLowerCase()}#g' frontend/${dir}/webpack.common.js`)
		
	    if (dir === 'app') {
            	// update nginx route
	    	console.log("update nginx route of the app")
            	await exec(`rm -f nginx/conf.d/default.conf && cp nginx/conf.d/default.base nginx/conf.d/default.conf`)

	        placeholder = "@SERVER_APP_SERVER_PORT@"
                await exec(`sed -i 's#${placeholder}#${process.env.SERVER_PORT_NUMBER}#g' nginx/conf.d/default.conf`)      
            
            	// nginx api bricks
            	placeholder = "@NGINX_BRICK_API@"
            	await exec(`sed -i 's#${placeholder}#${nginxBrickAPIRoutes}#g' nginx/conf.d/default.conf`)
	   }
        /*} catch(e) {
            console.log(e)
        }*/

        
    }

    

    async function step3() {
	console.log("step 3")
        for (let brickName of app.bricks) {
            try {
                console.log("DOCKER COMPOSE UP " + brickName)
                await exec(`cd bricks/${brickName} && docker-compose -f docker-compose.prod.yml down && docker-compose -f docker-compose.prod.yml -p ${app.appName} up --build -d`)
            } catch(e) {
                console.log(e)
            }
        }
    }

    
    await setup('app')
    await setup('admin')



	async function compile(dir, app) {
                try {
                    await exec(`cd frontend/${dir} && npm run build-prod`)
                    try {
                        console.log("generate manifest.json for " + dir)
                        await exec(`rm -f frontend/${dir}/dist/manifest.json && cp frontend/${dir}/entry/manifest.base.json frontend/${dir}/dist/manifest.json`)
                        let placeholder = "@@APP_SHORT_NAME@@"
                        await exec(`sed -i 's!${placeholder}!${app.appName}!g' frontend/${dir}/dist/manifest.json`)
                        placeholder = "@@APP_NAME@@"
                        await exec(`sed -i 's!${placeholder}!${app.name}!g' frontend/${dir}/dist/manifest.json`)
                        placeholder = "@@APP_COLOR@@"
                        await exec(`sed -i 's!${placeholder}!${app.color}!g' frontend/${dir}/dist/manifest.json`)
                        placeholder = "@@START_URL@@"
                        await exec(`sed -i 's!${placeholder}!${app.appName.toLowerCase()}!g' frontend/${dir}/dist/manifest.json`)
                        // add favicon to dist folder 
                        await exec(`rm -f frontend/${dir}/dist/favicon.ico && cp frontend/${dir}/entry/favicon.ico frontend/${dir}/dist/favicon.ico`)
                   } catch(e) {
                        console.log(e)
                   }
                } catch(e) {
                    console.log(e) 
                }
            }
            // webpack 
            console.log("webpack building... ")
            try {
                //await exec(`cd frontend/${dir} && npm run build-prod`)
                await Promise.all([compile('app', app), compile('admin', app)]) 
            } catch(e) {
               console.log(e) 
            }



    await step3()

    setTimeout(
        async () => {
            try {
	        console.log("step 4 - start nginx of magengine")
                await exec(`docker start ${app.appName.toLowerCase()}_nginx_1`)
                //await exec(`docker exec ${app.appName.toLowerCase()}_nginx_1 nginx -s reload`) 
                //await exec(`docker exec magengine_nginx_1 nginx -s reload`) 
            } catch(e) {
                console.log(e)
            }
        }, 
    7000)

    setTimeout(
        async () => {
	    console.log("step 5 - reload nginx of the app and magengine nginx")
            try {
                await exec(`docker exec ${app.appName.toLowerCase()}_nginx_1 nginx -s reload`) 
                await exec(`docker exec magengine_nginx_1 nginx -s reload`) 
            } catch(e) {
                console.log(e)
            }
        }, 
    10000)
    
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
    //const databaseURL = 'mongodb://mongo/mag-server'
    //await openDatabaseConnection(databaseURL)
    console.log('Server running at:', server.info.uri)
}


init()
start()

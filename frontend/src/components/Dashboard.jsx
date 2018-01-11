import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import Heading from "sq-web-components-core-react/elements/Heading"
import Checkbox from "sq-web-components-core-react/forms/Checkbox"
import Loader from "sq-web-components-core-react/elements/Loader"
import "./List.css"
import {IconDelete} from "sq-web-icons";


const TIME_INSTALLING = 45
const TIME_STOPPING = 10
const TIME_STARTING = 10
const TIME_DELETING = 5

class Dashboard extends Component {

    constructor(props) {
        super(props)
        this.state = {  
            showNextButton: false,
            list: []
        }
        this.messages = {
            "uninstalled": "offline",
            "stopped": "offline",
            "running": "online",
            "stopping": "stopping...",
            "starting": "starting...",
            "installing": "installing...",
            "deleting": "deleting...",
            "error": "an error occurred!"
        }
    }

    componentDidMount() {
        this.getAppList()
    }

    getAppList = async () => {

        let response
        try {
            response = await fetch("/api/list/app", { method: "GET" })
        } catch (e) {
            console.log(e)
            return
        }
        
        let list = await response.json()
        list.forEach((app) => {
            app.stateMessage = this.messages[app.state]
            if (this.messages[app.state] === 'installing' || 
                this.messages[app.state] === 'deleting' ||
                this.messages[app.state] === 'starting' ||
                this.messages[app.state] === 'stopping' ) {
                app.switchButtonVisibility = "hidden"
                app.loadingVisibility = "visible"
            } else {
                app.switchButtonVisibility = "visible"
                app.loadingVisibility = "hidden"
            }
        })
        console.log(list)
        this.setState({ list: list })

    }

    toggleApp = async (checked, event, index) => {
        console.log(event.target.name + " - " + checked + " " + parseInt(index))
        index = parseInt(index)
        let app = this.state.list[index]

        
        this.toggleButtonForApp(index)
        console.log(app)


      
        try {
            switch (app.state) {
                case 'uninstalled':
                    this.setStateForApp(index, "installing")
                    window.setTimeout(async () =>  {   
                            let app = await this.setStateForApp(index, "running")
                            this.setApp(app, index)
                            this.toggleButtonForApp(index)
                            this.getAppList()
                        }, TIME_INSTALLING * 1000, index)
                    await fetch("/api/install/" + app._id, { method: "PUT" })
                    break
                case 'running':
                case 'stopping':
                    this.setStateForApp(index, "stopping")  
                    window.setTimeout(async () =>  { 
                        let app = await this.setStateForApp(index, "stopped")
                        this.setApp(app, index)
                        this.toggleButtonForApp(index)
                    }, TIME_STOPPING * 1000, index)
                    await fetch("/api/stop/" + app._id, { method: "PUT" })
                break
                case 'stopped':
                case 'starting':
                    this.setStateForApp(index, "starting")
                    window.setTimeout(async () =>  {     
                        let app = await this.setStateForApp(index, "running")
                        this.setApp(app, index)
                        this.toggleButtonForApp(index)
                    }, TIME_STARTING * 1000, index)
                    await fetch("/api/start/" + app._id, { method: "PUT" })
                    break
            }

          

        } catch (e) {
            console.log(e)
            this.toggleButtonForApp(index)
            this.setStateForApp(index, "error")
            return
        }
    }

    setApp = (app, index) => {
        let list = this.state.list
        list[index] = app
        this.setState({ list: list })
        console.log(app)
    }

    toggleButtonForApp = (index) => {
        const app = this.state.list[index]
        app.switchButtonVisibility = (app.switchButtonVisibility === "visible") ? "hidden" : "visible"
        app.loadingVisibility = (app.loadingVisibility === "visible") ? "hidden" : "visible"
        this.setApp(app, index)
    } 

    setStateForApp = async (index, state) =>  {
        const app = this.state.list[index]
        let response
        try {
            response = await fetch("/api/state/" + app._id + "/" + state , { method: "PUT" })
            app.state = state
            app.stateMessage = this.messages[state]
        } catch (e) {
            console.log(e)
            app.state = 'error'
            app.stateMessage = this.messages['error']
        }
        this.setApp(app, index)
        return app
    }

    deleteApp = async (event, index) => {
        const app = this.state.list[index]
        console.log("delete app " + index)
        this.setStateForApp(index, "deleting")
        this.toggleButtonForApp(index)
        await fetch( "/api/" + app._id, { method: "DELETE" })
        window.setTimeout(async () =>  {     
            let list = this.state.list
            list.splice(index, 1)
            this.setState({ list: list })
        }, 2 * 1000, index);
    }

    setStateMessageForApp = (index, message) => {
        const app = this.state.list[index]
        app.stateMessage = message
        this.setApp(app, index)
    }


    render() {
        

        const displayNextButton = (this.state.showNextButton) ? "inline" : "none"

        const listApp = this.state.list.map( (app, index) => {
            let deleteButton = (app.state === 'uninstalled' || app.state === 'stopped' || app.state === 'deleting' || app.state === 'error' ) ? <span style={ {fontSize: "1.2rem"} }  onClick={ () => this.deleteApp(event, index) } ><IconDelete/></span>: <span/> 
            return (
                <Row key={ index } >
                    <RowItem xs={8}>
                        { app.name }
                        <br/>
                        <small>{ this.state.list[index].stateMessage } { (this.state.list[index].port < 0) ? '' : '' + this.state.list[index].port} </small>
                    </RowItem>
                    <RowItem xs={1} style={ {textAlign: "left"} }>
                        { deleteButton }
                    </RowItem>
                    <RowItem xs={3} style={ {paddingLeft: "2rem"} }>
                        <Checkbox checked = { app.state === 'running' } className={ this.state.list[index].switchButtonVisibility + " checkbox" } name={ app._id } isSwitch onChange={ (checked, event) => this.toggleApp(checked, event, index) } ></Checkbox>
                        <Loader className={ this.state.list[index].loadingVisibility + " loader" } type="dot"></Loader>  
                    </RowItem>
                </Row>
            )
        })
        
        return (
            <div>
                 <Row>
                    <RowItem xs={12} style={ {textAlign: "right"} }>
                        <Link to={ '/new/setName' }>
                            <Button level="success">Create A New App</Button>
                        </Link>
                    </RowItem>
                </Row>

                <Row>
                    <RowItem xs={12} style={ {textAlign: "left"} }>
                        <Heading size="xlarge">Apps</Heading>
                    </RowItem>
                </Row>

                { listApp }

            </div>
        )       
  }
}

export default Dashboard



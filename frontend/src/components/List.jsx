import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import Heading from "sq-web-components-core-react/elements/Heading"
import Checkbox from "sq-web-components-core-react/forms/Checkbox"
import Loader from "sq-web-components-core-react/elements/Loader"
import "./List.css"

class List extends Component {

    constructor(props) {
        super(props)
        this.state = {  
            showNextButton: false,
            list: []
        }
        this.messages = {
            "stopped": "offline",
            "running": "online",
            "installing": "installing..."
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
            app.switchButtonVisibility = "visible"
            app.loadingVisibility = "hidden"
            app.stateMessage = "offline"
        })

        this.setState({ list: list })

    }

    toggleApp = async (checked, event, index) => {
        console.log(event.target.name + " - " + checked)

        let list = this.state.list
        console.log(list)
        list[index].switchButtonVisibility = (list[index].switchButtonVisibility === "visible") ? "hidden" : "visible"
        list[index].loadingVisibility = (list[index].loadingVisibility === "visible") ? "hidden" : "visible"
        list[index].stateMessage = this.messages[app.state]
        console.log(list[index])
        this.setState({ list: list })

        let response
        try {
            const appId = event.target.name
            //response = await fetch("/api/start/" + appId, { method: "PUT" })
        } catch (e) {
            console.log(e)
            return
        }
    }


    render() {
        
        const displayNextButton = (this.state.showNextButton) ? "inline" : "none"

        

        const listApp = this.state.list.map( (app, index) => {
                    return (
                        <Row key={ index } >
                            <RowItem xs={8}>
                                { app.name }
                                <br/>
                                <small>{ this.state.list[index].stateMessage }</small>
                            </RowItem>
                            <RowItem xs={4} style={ {textAlign: "right"} }>
                                
                                <Checkbox className={ this.state.list[index].switchButtonVisibility + " checkbox" } name={ app._id } isSwitch onChange={ (checked, event) => this.toggleApp(checked, event, index) } ></Checkbox>
                                <Loader className={ this.state.list[index].loadingVisibility + " loader" } type="dot"></Loader>
                                   
                            </RowItem>
                        </Row>
                    )
                })
        
        return (
            <div>
                <Row>
                    <RowItem xs={12} style={ {textAlign: "center"} }>
                        <Heading size="xlarge">All Your App Are Listed Here:</Heading>
                        { /*<Heading size="xsmall">total 2 (1 online, 1 offline)</Heading> */ }
                    </RowItem>
                </Row>

                {listApp}

               {/*<Row style={ {textAlign: "center"} }>
                    <RowItem xs={8}>
                        app name
                    </RowItem>
                    <RowItem xs={4}>
                        <Loader type="circle">starting...</Loader>
                    </RowItem>
                </Row>*/}

            </div>
        )       
  }
}

export default List



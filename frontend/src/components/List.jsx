import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import Heading from "sq-web-components-core-react/elements/Heading"
import Checkbox from "sq-web-components-core-react/forms/Checkbox"
import Loader from "sq-web-components-core-react/elements/Loader"

class List extends Component {

    constructor(props) {
        super(props)
        this.state = {showNextButton: false, list: []}
    }

    componentDidMount() {
        this.getAppList()
    }

    toggleApp = (checked, e) => {
       // console.log(this.props.getNewApp())
    }

    getAppList = async () => {

        let response
        try {
            response = await fetch("/api/list/app", { method: "GET" })
        } catch (e) {
            console.log(e)
            return
        }
        
        this.setState({ list: await response.json() })

        console.log(this.state.list)
    }

    toggleApp = async (checked, event) => {
        console.log(event.target.name + " - " + checked)
        let response
        try {
            const appId = event.target.name
            response = await fetch("/api/start/" + appId, { method: "PUT" })
        } catch (e) {
            console.log(e)
            return
        }
    }


    render() {
        
        const displayNextButton = (this.state.showNextButton) ? "inline" : "none"
        const listApp = this.state.list.map(app => {
                    return (
                        <Row key={ app._id } >
                            <RowItem xs={8}>
                                { app.name }
                            </RowItem>
                            <RowItem xs={4} style={ {textAlign: "right", paddingTop: "0.5em"} }>
                                <Checkbox name={ app._id } isSwitch onChange={ this.toggleApp } ></Checkbox>
                            </RowItem>
                        </Row>
                    )
                })
        console.log(listApp)
        return (
            <div>
                <Row>
                    <RowItem xs={12} style={ {textAlign: "center"} }>
                        <Heading size="xlarge">All Your App Are Listed Here</Heading>
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



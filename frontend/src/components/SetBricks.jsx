import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import ButtonGroup from "sq-web-components-core-react/forms/ButtonGroup"
import Input from "sq-web-components-core-react/forms/Input"
import Heading from "sq-web-components-core-react/elements/Heading"
import Checkbox from "sq-web-components-core-react/forms/Checkbox"
import Notification, { NotificationActions } from "sq-web-components-core-react/collections/Notification"
import NotificationAlert from "sq-web-components-core-react/collections/NotificationAlert"

import "sq-web-icons/icons.css";
import {IconEditmode} from "sq-web-icons";
import {IconVertGraph} from "sq-web-icons";
import {IconDate} from "sq-web-icons";
import {IconPayments} from "sq-web-icons";
import {IconMoreMenu} from "sq-web-icons";
import {IconInfo_outline} from "sq-web-icons";
import {IconHelp_outline} from "sq-web-icons";
import "../assets/setBricks.css"

class SetBricks extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showNextButton: false,
            showErrorNotification: false,
            checked: []
        }
    }

    componentDidMount() {
        this.toggleNextButton()
    }

    toggleNextButton = () => {
        if (this.props.getBricks() && this.props.getBricks().length > 0) {
            this.setState({showNextButton: true})
        } else {
            this.setState({showNextButton: false})    
        }
    }

    setBricks = (brick) => {
        if (this.state.checked.indexOf(brick) < 0) {
            this.props.addBrick(brick)
            var newChecked = this.state.checked
            newChecked.push(brick)
            this.setState( {checked: newChecked})
        
        } else if (this.state.checked.indexOf(brick) >= 0) { 
            this.props.removeBrick(brick)
            var newChecked = this.state.checked.filter( (el) => el !== brick )
            this.setState({checked:newChecked })
        }
        this.toggleNextButton()
    }

    saveAppFileDescr = async () => {
       
        this.setState( {showErrorNotification: false} )
        console.log(JSON.stringify(this.props.getNewApp()))
        let response
        try {
            response = await fetch("/api/app", { method: "POST", body: JSON.stringify(this.props.getNewApp()) })
        } catch (e) {
            console.log(e)
            return
        }
        
        let status = await response.status
        if (status !== 201) {
            this.setState( {showErrorNotification: true} )
        } else {
            console.log(">" + response.blob())
            this.props.history.push('/dashboard')
        }
    }

    render() {
        
        const displayNextButton = (this.state.showNextButton) ? 'inline' : 'none'

        return (


            <Row>

                <NotificationAlert style={ {visibility: (this.state.showErrorNotification) ? "visible" : "hidden"} }>
                    <Notification level="error" onClose={() => { this.setState( {showErrorNotification: false} ) }}>
                        mag-engine server failed to handle the request
                    </Notification>
                </NotificationAlert>

                <RowItem xs={ 12 } style={ {textAlign: "center"} }>
                    <Heading size="xlarge">Which feature do you need?</Heading>
                    <Heading size="xsmall">last step!</Heading>
                </RowItem>
                <RowItem xs={ 12 } style={{marginBottom: "7rem"}} >
                    {console.log(this.state.checked.indexOf("redactor"))}
                    <div class={ (this.state.checked.indexOf("redactor") >= 0) ? "brick brick-selected": "brick"  } onClick={ () => this.setBricks('redactor') } style={{animationDelay: "200ms"}} >
                        <p style={{fontSize: "5rem", textAlign: "center"}}><IconEditmode /></p>
                        <Heading size="medium" style={ {textAlign: "center", paddingTop: "0.5rem"}}>Articles</Heading>
                    </div>

                    <div class={ (this.state.checked.indexOf("survey") >= 0) ? "brick brick-selected": "brick"  } onClick={ () => this.setBricks('survey') } style={{animationDelay: "400ms"}}  >
                        <p style={{fontSize: "5rem", textAlign: "center"}}><IconVertGraph /></p>
                        <Heading size="medium" style={ {textAlign: "center", paddingTop: "0.5rem"}}>Survey</Heading>
                    </div>

                    <div class="brick" style={{animationDelay: "600ms"}}>
                        <p style={{fontSize: "5rem", textAlign: "center"}}><IconDate /></p>
                        <Heading size="medium" style={ {textAlign: "center", paddingTop: "0.5rem"}}>Calendar</Heading>
                    </div>

                    <div class="brick" style={{animationDelay: "800ms"}}>
                        <p style={{fontSize: "5rem", textAlign: "center"}}><IconMoreMenu /></p>
                        <Heading size="medium" style={ {textAlign: "center", paddingTop: "0.5rem"}}>Food Menu</Heading>
                    </div>

                    <div class="brick" style={{animationDelay: "1000ms"}}>
                        <p style={{fontSize: "5rem", textAlign: "center"}}><IconHelp_outline /></p>
                        <Heading size="medium" style={ {textAlign: "center", paddingTop: "0.5rem"}}>Q&A</Heading>
                    </div>

                    <div class="brick" style={{animationDelay: "1100ms"}}>
                        <p style={{fontSize: "5rem", textAlign: "center"}}><IconInfo_outline /></p>
                        <Heading size="medium" style={ {textAlign: "center", paddingTop: "0.5rem"}}>General Info</Heading>
                    </div>


                   {/* <Checkbox name="redactor" onChange={ this.setBricks } defaultChecked={ this.props.getBricks().indexOf('redactor') > -1 } >Articles</Checkbox>
                    <Checkbox name="survey" onChange={ this.setBricks } defaultChecked={ this.props.getBricks().indexOf('survey') > -1} >Surveys</Checkbox> */}
                    
                </RowItem>
	           
                <RowItem xs={ 4 } >
                    <Link to={ '/new/setColor' }><Button block>Previous</Button></Link>
                </RowItem>
                <RowItem xs={ 4 } >
                    <Link to={ '/dashboard' }><Button block >Cancel</Button></Link>
                </RowItem>
                <RowItem xs={ 4 } >
                    <Button block style={ {display: displayNextButton} } onClick={ this.saveAppFileDescr } level="info">Next</Button>
                </RowItem>
            

            </Row>
        )       
  }
}

export default SetBricks



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

class SetBricks extends Component {

    constructor(props) {
        super(props)
        this.state = {
            showNextButton: false,
            showErrorNotification: false
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

    setBricks = (checked, e) => {
        if (checked) {
            this.props.addBrick(e.target.name)
        } else {
            this.props.removeBrick(e.target.name)
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
                <RowItem xs={ 12 } style={ {left: "40%"} } >
                    <Checkbox name="redactor" onChange={ this.setBricks } defaultChecked={ this.props.getBricks().indexOf('redactor') > -1 } >Articles</Checkbox>
                    <Checkbox name="survey" disabled onChange={ this.setBricks } defaultChecked={ this.props.getBricks().indexOf('survey') > -1} >Surveys</Checkbox>
                </RowItem>
	           
                <RowItem xs={ 12 } >
                    <Button block style={ {display: displayNextButton} } onClick={ this.saveAppFileDescr } level="info">Next</Button>
                </RowItem>
                <RowItem xs={ 12 } >
                    <Link to={ '/new/setColor' }><Button block>Previous</Button></Link>
                </RowItem>
                <RowItem xs={ 12 } >
                    <Link to={ '/dashboard' }><Button block >Cancel</Button></Link>
                </RowItem>
            

            </Row>
        )       
  }
}

export default SetBricks



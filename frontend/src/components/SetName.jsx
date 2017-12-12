import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import ButtonGroup from "sq-web-components-core-react/forms/ButtonGroup"
import Input from "sq-web-components-core-react/forms/Input"
import Heading from "sq-web-components-core-react/elements/Heading"

class SetName extends Component {

    constructor(props) {
        super(props)
        this.state = {showNextButton: false}
    }

    componentDidMount() {
        this.toggleNextButton()
    }


    toggleNextButton = () => {
        if (this.props.getName() && this.props.getName().length > 0) {
            this.setState({showNextButton: true})
        } else {
            this.setState({showNextButton: false})    
        }
    }

    setName = (e) => {
        const appName = e.target.value
        this.props.setName(appName)
        this.toggleNextButton()
    }

    render() {
        
        const displayNextButton = (this.state.showNextButton) ? 'inline' : 'none'

        return (
            <Row>
                <RowItem xs={12} style={{textAlign: "center"}}>
                    <Heading size="xlarge">Name your app</Heading>
                    <Heading size="xsmall">step 1 out of 3</Heading>
                </RowItem>
                <RowItem xs={12}>
                    <Input onChange={ this.setName } value={ this.props.getName() } name="app-name" placeholder="the shorter the better"  />
                </RowItem>
                <RowItem xs={12} >
                    <Link to={ '/new/setColor' }><Button block style={ {display: displayNextButton} } level="info">Next</Button></Link>
                </RowItem>
	            <RowItem xs={12} >
                    <Link to={ '/' }><Button block >Cancel</Button></Link>
                </RowItem>
               
            </Row>
        )       
  }
}

export default SetName



import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import ButtonGroup from "sq-web-components-core-react/forms/ButtonGroup"
import Input from "sq-web-components-core-react/forms/Input"
import Heading from "sq-web-components-core-react/elements/Heading"

class Start extends Component {

    constructor(props) {
        super(props)
    }


    render() {
        
        return (
            <Row>
                <RowItem xs={12} style={{textAlign: "center"}}>
                    <Heading size="xlarge">Summary</Heading>
                </RowItem>
                <RowItem xs={12}>
                    
                </RowItem>
	            <RowItem xs={12} style={{textAlign: "right", right: "25%"}}>
                    <ButtonGroup>
                        <Link to={ '/' }><Button>Cancel</Button></Link>
                        <Link to={ '/new/setColor' }><Button level="success">Launch the App</Button></Link>
                    </ButtonGroup>
                </RowItem>
            </Row>
        )       
  }
}

export default Start



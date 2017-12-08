import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { CirclePicker } from 'react-color'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import ButtonGroup from "sq-web-components-core-react/forms/ButtonGroup"
import Heading from "sq-web-components-core-react/elements/Heading"

class SetColor extends Component {

    constructor(props) {
        super(props)
    }


    render() {
        
        return (
            <Row>
                <RowItem xs={12} style={{textAlign: "center"}}>
                    <Heading size="xlarge">Time for painting!</Heading>
                    <Heading size="xsmall" style={{color: "gray"}}>carefully pick the main color for your app</Heading>
                </RowItem>
                <RowItem xs={12} style={{textAlign: "center"}}>
                    <div style={ {display: "inline-flex"} }>
                        <CirclePicker width={ 250 } circleSize={ 32 } onChangeComplete={ this.colorHasBeenSelected } />
                    </div>
                </RowItem>
	            <RowItem xs={12} style={{textAlign: "right", right: "25%"}}>
                    <ButtonGroup>
                        <Link to={ '/' }><Button>Cancel</Button></Link>
                        <Link to={ '/new/setName' }><Button>Back</Button></Link>
                        <Link to={ '/new/getBricks' }><Button level="info">Next</Button></Link>
                    </ButtonGroup>
                </RowItem>
            </Row>
        )       

  }
}

export default SetColor



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
        this.state = {showNextButton: false}
    }

    componentDidMount() {
        this.toggleNextButton()
    }

    toggleNextButton = () => {
        if (this.props.getColor()) {
            this.setState({showNextButton: true})
        } else {
            this.setState({showNextButton: false})    
        }
    }

    setColor = (color, e) => {
        const primaryColor = color.hex
        this.props.setColor(primaryColor)
        this.toggleNextButton()
    }

    render() {
        
        const displayNextButton = (this.state.showNextButton) ? 'inline' : 'none'
        
        return (
            <Row>
                <RowItem xs={12} style={{textAlign: "center"}}>
                    <Heading size="xlarge">Time For Painting!</Heading>
                    <Heading size="xsmall">step 2 out of 3</Heading>
                </RowItem>
                <RowItem xs={12} style={{textAlign: "center", marginTop: "2rem"}}>
                    <Heading size="xsmall" style={{color: "gray"}}>carefully pick the main color of your app</Heading>
                    <div style={ {display: "inline-flex", marginTop: "2rem"} } >
                        <CirclePicker width={ 250 } circleSize={ 32 } onChangeComplete={ this.setColor } colors={["#fd7f60", "#f74f88", "#dd5ef3", "#9051ff", "#6a76bb", "#5871ff", "#00b0ff", "#00e2ff", "#00d8c4", "#79ff7e", "#8bc34a", "#cddc39", "#ffeb3b", "#ffc107", "#ff9800", "#fa5b35", "#b38e81", "#cecece"]} color={ this.props.getColor() } />
                    </div>
                </RowItem>
              
                
                <RowItem xs={12} >
                    <Link to={ '/new/setBricks' }><Button block style={ {display: displayNextButton} } level="info">Next</Button></Link>
                </RowItem>
                <RowItem xs={12} >
                    <Link to={ '/new/setName' }><Button block>Previous</Button></Link>
                </RowItem>
                <RowItem xs={12} >
                    <Link to={ '/dashboard' }><Button block >Cancel</Button></Link>
                </RowItem>
            
            </Row>
        )       

  }
}

export default SetColor



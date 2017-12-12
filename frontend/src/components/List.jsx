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
        this.state = {showNextButton: false}
    }

    componentDidMount() {
        
    }

    toggleApp = (checked, e) => {
       // console.log(this.props.getNewApp())
    }


    render() {
        
        const displayNextButton = (this.state.showNextButton) ? 'inline' : 'none'

        return (
            <div>
                <Row>
                    <RowItem xs={12} style={{textAlign: "center"}}>
                        <Heading size="xlarge">All Your App Are Listed Here</Heading>
                        <Heading size="xsmall">total 2 (1 online, 1 offline)</Heading>
                    </RowItem>
                </Row>
            
                <Row styles={ {background: "red"} }>
                    <RowItem xs={8}>
                        app name
                    </RowItem>
                    <RowItem xs={4}>
                        <Checkbox name="appId" isSwitch onChange={ this.toggleApp } >online/offline</Checkbox>
                    </RowItem>
                </Row>

                <Row styles={ {background: "red"} }>
                    <RowItem xs={8}>
                        app name
                    </RowItem>
                    <RowItem xs={4}>
                    <Loader type="circle">starting...</Loader>
                    </RowItem>
                </Row>

            </div>
        )       
  }
}

export default List



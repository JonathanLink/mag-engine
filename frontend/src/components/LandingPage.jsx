import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import ButtonGroup from "sq-web-components-core-react/forms/ButtonGroup"
import Input from "sq-web-components-core-react/forms/Input"
import Heading from "sq-web-components-core-react/elements/Heading"

class LandingPage extends Component {

    constructor(props) {
        super(props)
    }


    render() {
        
        return (
            <Row>
                <RowItem xs={12}>
                    <Heading size="xlarge">What is MAG?</Heading>
                    It stands for Mobile App Generator. Through a very simple web application, one can create simple progressive web applications for any devices.
                </RowItem>
                <RowItem xs={12}>
                    <Link to={ '/dashboard' }><Button block level="success">Start</Button></Link>
                </RowItem>
                <RowItem xs={12}>
                    <Heading size="xlarge">Use cases:</Heading>
                    Whether it's for personal or profesional usage, you might be interested by using this solution to gain time.
                    <ul>
                        <li>Restaurants (i.e. food trucks)</li>
                        <li>Small events such as music festival, movie festival, ...</li>
                        <li>Bloggers</li>
                        <li>...</li>
                    </ul>
                </RowItem>
                <RowItem xs={12}>
                    <Heading size="xlarge">Why Progressive Web Applications?</Heading>
                    PWA takes full avantage of web and browsers technology to make web apps look and behave like native apps.<br/>
                    <ul>
                        <li>the app can be downloaded and installed from the browser (no need for any app store)</li>
                        <li>the app works in offline mode</li>
                        <li>the app automatically updates itself</li>
                    </ul>
                </RowItem>
                <RowItem xs={12}>
                    <Heading size="xlarge">SDK for developers:</Heading>
                    Download the sample app and read the documentation to learn more about module developement. <br/>
                    We made it very easy and extremely flexible. As each module runs its own set of docker containers, you as a developer is free to choose your own backend stack!
                    <ul>
                        <li>frontend: react 16</li>
                        <li>backend: whatever you want!</li>
                    </ul> 
                    Modules can be then directely downloaded and installed from any git repository. 
                </RowItem>
	           
            </Row>
        )       
  }
}

export default LandingPage



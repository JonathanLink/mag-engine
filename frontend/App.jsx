import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import SetName from './src/components/SetName'
import SetColor from './src/components/SetColor'
import SetBricks from './src/components/SetBricks'
import Dashboard from './src/components/Dashboard'
import LandingPage from './src/components/LandingPage'

import './node_modules/sq-web-components-core-theme/sq-web-components-core-theme.min.css'
import './styles.css'

import Navbar, {NavbarItem, NavbarSection} from "sq-web-components-core-react/collections/Navbar"
import Nav, { NavItem } from "sq-web-components-core-react/collections/Nav"
import List, { ListItem } from "sq-web-components-core-react/collections/List"
import {IconMenu, IconArrowback} from 'sq-web-icons'
import Heading from "sq-web-components-core-react/elements/Heading"
import Button from "sq-web-components-core-react/forms/Button"

import './src/assets/style/overwritten-components/components-core_Row.css'
import './src/assets/style/overwritten-components/components-core_Drawer.css'
import './src/assets/style/overwritten-components/components-core_Card.css'

class App extends Component {

    constructor() {
        super()
        this.state = {
            newApp: {
                name: "",
                appName: "",
                color: "",
                bricks: []
            }
        }
    }

    uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        )
    }

    setName = (name) => {
        this.state.newApp.name = name
        const formatNameToAppName = (n) => {
            const toUpperCase = (s) => {
                return s.substr(0, 1).toUpperCase() + s.substr(1)
            }
            return n.split(' ').filter(i => i !== '').reduce( (a, i) => a + toUpperCase(i) )
        } 
        if (name.length > 1) {
            this.state.newApp.appName = formatNameToAppName(name)
        } else {
            this.state.newApp.appName = ""
        }
	this.state.newApp.color = ""
	this.state.newApp.bricks = []
	console.log(this.state.newApp)
    }

    getName = (name) => {
        return this.state.newApp.name
    }

    setColor = (color) => {
        this.state.newApp.color = color
        console.log(this.state.newApp)
    }

    getColor = () => {
        return this.state.newApp.color
    }

    addBrick = (brick) => {
        if ( this.state.newApp.bricks.indexOf(brick) < 0) {
            this.state.newApp.bricks.push(brick)
        }
        console.log(this.state.newApp)
    }

    removeBrick = (brick) => {
        if ( this.state.newApp.bricks.indexOf(brick) >= 0) {
            this.state.newApp.bricks.splice(this.state.newApp.bricks.indexOf(brick), 1)
        }
        console.log(this.state.newApp)
    }

    getBricks = () => {
        return this.state.newApp.bricks
    }

    getNewApp = () => {
        return this.state.newApp
    }

    render() {
        return (
            <Router>
                <div>
                    <Navbar app fixed position="top"> 
                        <Nav>
                            <NavbarItem>
                                <Heading size="xlarge">Mobile App Generator</Heading>
                                <Heading size="xsmall" style={{color: "gray"}}>Proof of Concept</Heading>
                            </NavbarItem>
                        </Nav>
                    </Navbar>
                    <div className="container">
                        <Switch>
                            <Route exact path='/' component={LandingPage}/>
                            <Route exact path='/new/setName'
                                render={ (props) => {
                                        //this.setId()
                                        props.setName = this.setName
                                        props.getName = this.getName
                                        return React.createElement(SetName, props)
                                    }
                                }
                            />
                            <Route exact path='/new/setColor'
                                render={ (props) => {
                                        props.setColor = this.setColor
                                        props.getColor = this.getColor
                                        return React.createElement(SetColor, props)
                                    }
                                }
                            />
                            <Route exact path='/new/setBricks'
                                render={ (props) => {
                                        props.addBrick = this.addBrick
                                        props.removeBrick = this.removeBrick
                                        props.getBricks = this.getBricks
                                        props.getNewApp = this.getNewApp
                                        return React.createElement(SetBricks, props)
                                    }
                                }
                            />
                            <Route exact path='/dashboard'
                                render={ (props) => {
                                        props.getAppId = this.getAppId
                                        return React.createElement(Dashboard, props)
                                    }
                                }
                            />
                           
                        </Switch>
                    </div>
                </div> 
            </Router>
        )
    }


}

export default App




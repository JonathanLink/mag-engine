import React, { Component } from 'react'
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom'
import New from './src/components/New'
import SetName from './src/components/SetName'
import SetColor from './src/components/SetColor'

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
                            <Route exact path='/' component={New}/>
                            <Route path='/new/setName' component={SetName}/>
                            <Route path='/new/setColor' component={SetColor}/>
                            <Route path='/new/getBricks' component={New}/>
                            <Route path='/:appId/dashboard' component={New}/>
                        </Switch>
                    </div>
                </div> 
            </Router>
        )
    }


}

export default App




import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Row, { RowItem } from "sq-web-components-core-react/collections/Row"
import Button from "sq-web-components-core-react/forms/Button"
import constructionImage from '../assets/images/construction.png'

class New extends Component {

    constructor(props) {
        super(props)
    }


    render() {
        
        return (
            <Row>
	            <RowItem xs={12} style={{textAlign: "center"}}>
                    <Link to={ '/new/setName' } >
                        <Button level="success" size="large">Create A New App</Button>
                    </Link>
                </RowItem>
            </Row>
        )       
  }
}

export default New



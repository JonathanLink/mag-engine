import React, { Component } from 'react'
import Button from 'sq-web-components-core-react/forms/Button'
import Card, {CardMedia, CardItem, CardActions, CardHeader, CardFooter, CardMenu } from 'sq-web-components-core-react/collections/Card'
import Heading from 'sq-web-components-core-react/elements/Heading'
import Dialog, {DialogHeader, DialogContent, DialogFooter  } from 'sq-web-components-core-react/collections/Dialog'
import Row, {RowItem} from 'sq-web-components-core-react/collections/Row'
import Checkbox from 'sq-web-components-core-react/forms/Checkbox'


class Home extends Component {


    componentWillMount() {
        this.props.registerBrickView(this.props.history, true)
    }

    componentDidMount() {
        this.props.history.push('/articles')
    }

    render() {
        return <div/>
    }

}

export default Home




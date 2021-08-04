import React, { Component, } from 'react'
import {
    Button,
} from 'antd';
import 'antd/dist/antd.css';
import './home.less'
import logo from './../../assets/images/mella.png'
import MaxMin from './../../utils/maxMin/MaxMin'
export default class Home extends Component {
    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('small')
    }
    _quickStart = () => {
        console.log('dianji2')
        this.props.history.push('/page1')
    }
    _emergency = () => {
        console.log('dianji3')
    }


    render () {
        return (

            <div id="home">
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                />
                <div className="heard" ><img src={logo} alt="" /></div>
                <div className="button">
                    <Button

                        type="primary"
                        shape="round"
                        size='large'
                        // onClick={() => { this.props.history.push('/page8') }}>
                        onClick={() => { this.props.history.push('/page11') }}>
                        Sign in with Email
                    </Button>

                </div>
                <div className="button">
                    <Button
                        type="primary"
                        shape="round"
                        size='large'
                        onClick={this._quickStart}>
                        Sign in with PMS
                    </Button>

                </div>
                <p className="text">Do not have an account?</p>

                <div className="create">
                    <Button
                        type="primary"
                        shape="round"
                        size='large'
                    // onClick={this._quickStart}
                    >
                        Create an Account
                    </Button>
                </div>

                {/* <div
                    className="botton"
                    onClick={this._emergency}
                >

                    Emergency?<br />
                    Take a Temperature as Guest

                </div> */}

            </div>
        )
    }
}
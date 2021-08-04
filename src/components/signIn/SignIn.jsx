import React, { Component } from 'react'
import { Input, Button, Menu, List, Modal, Table, Tag, Space, Popconfirm, Tooltip, message, Select } from 'antd';

import './signIn.less'
import mellaLogo from './../../assets/images/mellaLogo.png'
import dui from './../../assets/images/dui.png'
import facebook from './../../assets/images/facebook.png'
import google from './../../assets/images/google.png'
import apple from './../../assets/images/apple.png'
import { fetchRequest } from './../../utils/FetchUtil1'
let storage = window.localStorage;
export default class SignIn extends Component {

  state = {
    isRemember: false,
    email: '',
    hash: ''

  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')
    console.log('--', storage.signIn, '---', storage.signIn === undefined);
    if (storage.signIn !== undefined && storage.signIn !== '') {
      let data = storage.signIn
      data = JSON.parse(data)
      this.setState({
        email: data.email,
        hash: data.hash
      })
    }
    if (storage.isRemember !== undefined) {
      switch (storage.isRemember) {
        case 'true': this.setState({ isRemember: true }); break;
        case 'false': this.setState({ isRemember: false }); break;
      }
    }
  }

  _continue = () => {
    const { email, hash, isRemember } = this.state
    console.log();
    let params = {
      email,
      hash,
      identityTypeId: '1'
    }
    if (email === '') {
      message.error('please input your email')
      return
    }
    if (hash === '') {
      message.error('please input your password')
      return
    }
    fetchRequest('/user/mellaLogin', 'POST', params)
      .then(res => {
        console.log(res);
        storage.userId = ''
        if (res.code === 10001 && res.msg === '账号错误') {
          message.error('Account error');
          return
        }
        if (res.code === 10002 && res.msg === '密码错误') {
          message.error('wrong password')
          return;
        }
        if (res.code === 0 && res.msg === 'success') {
          if (isRemember === true) {
            let data = {
              email,
              hash
            }
            data = JSON.stringify(data)
            console.log(data);
            storage.signIn = data
          } else {
            storage.signIn = ''
          }
          storage.userId = res.success.userId
          this.props.history.push('/page8')
        }
      })
      .catch(err => {
        console.log(err);
      })


  }

  render () {
    return (
      <div id="signIn">
        <div className="iconfont icon-left heard return" onClick={() => { this.props.history.push('/') }} />
        <div className="logo">
          <img src={mellaLogo} alt="" />
        </div>
        <div className="text">
          Please enter email and password
        </div>
        <div className="inpF">
          <Input className='inp'
            style={{ border: 'none', outline: 'medium' }}
            value={this.state.email}
            placeholder='rachel@friends.com'
            bordered={false}
            onChange={(item) => {
              let str = item.target.value
              this.setState({
                email: str
              })
            }}
          />
          <Input.Password className='inp'
            visibilityToggle={false}
            style={{ border: 'none', outline: 'medium' }}
            value={this.state.hash}
            placeholder='********'
            bordered={false}
            onChange={(item) => {
              let str = item.target.value
              this.setState({
                hash: str
              })
            }}
          />
        </div>
        <div className="stay">
          <div className="remember">
            <p>Stay Signed In</p>
            <div className="box" onClick={() => {
              let { isRemember } = this.state
              this.setState({
                isRemember: !isRemember
              })
              storage.isRemember = !isRemember

            }}>
              {this.state.isRemember && <img src={dui} alt="" />}
            </div>
          </div>
          <div className="forgot">Forgot?</div>
        </div>

        <div className="button">
          <Button
            type="primary"
            shape="round"
            size='large'
            onClick={this._continue}
          >
            CONTINUE
          </Button>

        </div>

        <div className="text2">
          <p>Do not have an account? <span>Sign Up</span></p>
        </div>

        <div className="other">
          <div className='line' /> <span>or sign up via</span>  <div className='line' />
        </div>

        <div className="foot">
          <img src={google} alt="" />
          <img src={facebook} alt="" />
          <img src={apple} alt="" />
        </div>

      </div>
    )
  }
}
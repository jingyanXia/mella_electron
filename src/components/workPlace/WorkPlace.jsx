import React, { Component, } from 'react'
import {
  Select,
  Button,
  Modal

} from 'antd';
import 'antd/dist/antd.css';

import './workplace.less'
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'
import { fetchRequest1 } from './../../utils/FetchUtil'

const { Option } = Select;
let storage = window.localStorage;
export default class WorkPlace extends Component {
  state = {
    organization: '',

  }
  componentDidMount () {
    let ipcRenderer = window.electron.ipcRenderer
    ipcRenderer.send('small')


  }
  _select = (value, e) => {
    console.log(value, e);  //value的值为id

  }

  _next = () => {
    this.props.history.push('/page8')
  }
  render () {
    let department = 'Anesthesia'
    console.log(storage.department);
    if (storage.department != undefined) {
      department = storage.department
    }
    return (
      <div id="workplace1111">
        {/* 关闭缩小 */}
        <MaxMin
          onClick={() => { this.props.history.push('/') }}
          onClick1={() => this.props.history.push('/page8')}
        />

        <div className="text">Choose personal information</div>
        <div className="select" >
          <p>Select Organization:</p>
          <Select style={{ width: 260 }}
            defaultValue={'University of Georgia'}
            onChange={(val, e) => {
              console.log(val, e)
              this.setState({ organization: e.children })
            }}>
            <Option value="1">University of Georgia</Option>
          </Select>
        </div>

        <div className="select" >
          <p>Select Location:</p>
          <Select style={{ width: 260 }}
            defaultValue={'UGA Veterinary Teaching Hospital'}
            onChange={(val, e) => {
              console.log(val, e)
              this.setState({ organization: e.children })
            }}>
            <Option value="1">UGA Veterinary Teaching Hospital</Option>
          </Select>
        </div>

        <div className="select" >
          <p>Select Department:</p>
          <Select style={{ width: 260 }}
            defaultValue={department}
            onChange={(val, e) => {
              console.log(val, e)
              storage.department = e.children
              this.setState({ organization: e.children })

            }}>
            <Option value="1">Anesthesia</Option>
            <Option value="2">Emergency room</Option>
          </Select>
        </div>


        {/* 按钮 */}
        <div className="btn">
          <Button
            type="primary"
            shape="round"
            size='large'
            onClick={this._next}
          >
            Continue
          </Button>
        </div>

      </div>

    )
  }
}
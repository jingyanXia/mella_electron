import React, { Component, } from 'react'
import {
    Button,
    Input,
    Form,
    Select
} from 'antd';
import { createFromIconfontCN } from '@ant-design/icons';

import 'antd/dist/antd.css';
import MaxMin from './../../utils/maxminreturn/MaxMinReturn'
import dui from './../../assets/images/dui.png'
import './esyVetLogin.less'
import { FetchEszVet } from './../../utils/FetchEszVet'
import { fetchRequest2 } from './../../utils/FetchUtil2'


let storage = window.localStorage;
const { Option } = Select;
export default class EzyNetLogin extends Component {

    state = {
        isRemember: false,
        client_id: '',
        client_secret: '',
        partner_id: ''
    }

    componentDidMount () {
        let ipcRenderer = window.electron.ipcRenderer
        ipcRenderer.send('middle')
        storage.ezyVetToken = ''
    }
    componentWillMount () {
        console.log(storage.ezyVetLogin1, storage.ezyVetLogin1 !== '', storage.ezyVetToken1 !== undefined, `${storage.ezyVetToken1}` !== 'undefined');
        console.log(storage.ezyVetLogin1, storage.ezyVetLogin !== '', storage.ezyVetToken !== undefined, `${storage.ezyVetToken}` !== 'undefined');
        if (storage.ezyVetLogin !== '' && storage.ezyVetToken !== undefined && `${storage.ezyVetToken}` !== 'undefined') {
            try {
                let data = JSON.parse(storage.ezyVetLogin)
                console.log('--', data);
                this.setState({
                    isRemember: data.isRemember,
                    client_id: data.client_id,
                    client_secret: data.client_secret,
                    partner_id: data.partner_id
                })
            } catch (error) {
                console.log(error);
            }

        }
    }


    render () {
        const formItemLayout = {
            labelCol: {
                xs: { span: 10 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 14 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 10,
                    offset: 0,
                },
                sm: {
                    span: 8,
                    offset: 7,
                },
            },
        };
        const onFinish = (values) => {
            console.log('Received values of form: ', values);
            let parames = {
                client_id: values.client_id,
                client_secret: values.client_secret,
                grant_type: "client_credentials",
                partner_id: values.partner_id,
                scope: "read-address,read-animal,read-animalcolour,read-appointment,read-appointmentstatus,read-appointmenttype,read-assessment,read-attachment,read-batch,read-billingcredit,read-breed,read-communication,read-consult,read-contact,read-contactassociation,read-contactdetail,read-contactdetailtype,read-country,read-diagnostic,read-diagnosticrequest,read-diagnosticresult,read-diagnosticresultitem,read-healthstatus,read-history,read-integrateddiagnostic,read-invoice,read-invoiceline,read-jobqueue,read-operation,read-payment,read-paymentallocation,read-paymentmethod,read-physicalexam,read-plan,read-prescription,read-prescriptionitem,read-presentingproblem,read-presentingproblemlink,read-priceadjustment,read-product,read-productgroup,read-productminimumstock,read-productpricing,read-productsupplier,read-purchaseorder,read-purchaseorderitem,read-receiveinvoice,read-receiveinvoiceitem,read-resource,read-separation,read-sex,read-species,read-stocktransaction,read-systemsetting,read-tag,read-tagcategory,read-tagname,read-therapeutic,read-user,read-vaccination,read-webhookevents,read-webhooks,read-wellnessplan,read-wellnessplanbenefit,read-wellnessplanbenefititem,read-wellnessplanmembership,read-wellnessplanmembershipoption,read-wellnessplanmembershipstatusperiod,write-appointment,write-attachment,write-consult,write-contact,write-healthstatus,write-invoice,write-invoiceline,write-payment,write-stockadjustment,write-stockadjustmentitem,write-webhooks"
            }

            console.log(parames);
            FetchEszVet('/oauth/access_token', 'POST', parames)
                .then((res) => {
                    console.log(res);
                    if (res) {
                        storage.ezyVetToken = res.access_token
                        if (this.state.isRemember) {
                            storage.ezyVetLogin = JSON.stringify({
                                client_id: values.client_id,
                                client_secret: values.client_secret,
                                partner_id: values.partner_id,
                                isRemember: this.state.isRemember
                            })
                        } else {
                            storage.ezyVetLogin = ''
                        }

                        this.props.history.push('EzyVetSelectTime')
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

        };
        const _next = (values) => {
            console.log('Received values of form: ', values);
            let parames = {
                clientId: values.client_id,
                clientSecret: values.client_secret,
                partnerId: values.partner_id,
            }
            console.log(parames);
            fetchRequest2('/EzyVet/ezyvetauth', 'GET', parames, '')
                .then((res) => {
                    console.log(res);
                    if (res && res.msg === 'success') {

                        storage.ezyVetToken = res.data
                        if (this.state.isRemember) {
                            storage.ezyVetLogin = JSON.stringify({
                                client_id: values.client_id,
                                client_secret: values.client_secret,
                                partner_id: values.partner_id,
                                isRemember: this.state.isRemember
                            })
                        } else {
                            storage.ezyVetLogin = ''
                        }
                        storage.selectTime = ''

                        this.props.history.push('EzyVetSelectTime')
                    }
                })
                .catch((err) => {
                    console.log(err);
                });

        }
        let { client_id, client_secret, partner_id } = this.state

        return (
            <div id="eszVetLogin">
                {/* 关闭缩小 */}
                <MaxMin
                    onClick={() => { this.props.history.push('/') }}
                    onClick1={() => this.props.history.push('/page1')}
                />
                <div className="text">
                    Please enter your user information
                </div>
                <div className="form">
                    <Form
                        {...formItemLayout}
                        name="register"
                        onFinish={_next}
                        initialValues={{
                            client_id, client_secret, partner_id
                        }}

                        scrollToFirstError
                    >
                        <Form.Item
                            name="client_id"
                            label="Client ID"
                            rules={[{ required: true, message: 'Please input your Client ID!', whitespace: true }]}

                        >
                            <Input className='inp' />
                        </Form.Item>
                        <Form.Item
                            name="client_secret"
                            label="Client Secret"
                            rules={[{ required: true, message: 'Please input your Client Secret!', whitespace: true }]}
                            hasFeedback
                        >
                            <Input.Password className='inp' />
                        </Form.Item>
                        <Form.Item
                            name="partner_id"
                            label="Partner ID"
                            rules={[{ required: true, message: 'Please input your Partner ID!', whitespace: true }]}
                        >
                            <Input className='inp' />
                        </Form.Item>

                        <Form.Item
                            {...tailFormItemLayout}
                        >
                            <div className="btn">
                                <Button
                                    type="primary"
                                    shape="round"
                                    size='large'
                                    htmlType="submit"
                                >
                                    Next
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </div>
                <div className="remember">
                    <p>Stay Signed In:</p>
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
            </div>
        )
    }
}
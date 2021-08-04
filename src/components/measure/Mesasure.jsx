import React, { Component } from 'react'
import { Input, Button, Menu, List, Modal, Table, Tag, Space, Popconfirm, Tooltip, message, Select } from 'antd';
import Draggable from "react-draggable";
import moment from 'moment'
import 'antd/dist/antd.css';
import { createFromIconfontCN, SyncOutlined } from '@ant-design/icons';
// 引入 ECharts 主模块
import echarts from 'echarts/lib/echarts';
import ReactECharts from 'echarts-for-react';
// 引入柱状图
import 'echarts/lib/chart/bar';
// 引入提示框和标题组件
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import { fetchRequest } from './../../utils/FetchUtil1'
import { fetchRequest1 } from './../../utils/FetchUtil'

import ye from './../../assets/images/ye1.png'
import dog from './../../assets/images/dog.png'
import cat from './../../assets/images/cat.png'
import other from './../../assets/images/other.png'
import edit from './../../assets/images/edit.png'
import del from './../../assets/images/del.png'
import placement_gang from './../../assets/images/placement_gang.png'
import placement_er from './../../assets/images/placement_er.png'
import palcement_ye from './../../assets/images/palcement_ye.png'
import './mesasure.less'
const { SubMenu } = Menu;
const { Option } = Select;
const MyIcon = createFromIconfontCN({
  scriptUrl: '//at.alicdn.com/t/font_2326495_7b2bscbhvvt.js'
})

let storage = window.localStorage;
let echartCi = 0
let saveHistoryTime = null, getSerialTime = null
let ipcRenderer = window.electron.ipcRenderer
let detectTimer = null, countdownTimer = null, lastConnectionTime = null;
let disconnectedNum = 0

let isClick = true
let disconnectedTimer = null
let num = 0, is97Time = null, is193Time = null, initTime = null


export default class Mesasure extends Component {
  state = {
    closebgc: '',
    minbgc: '',
    closeColor: '',
    value: '',
    api: '',
    id: '',
    dataArr: [],
    seleceID: '',//医生id
    data: { ci: [''], wen: [] },
    echarsData: {
      Eci: [],
      wen0: [],
      wen1: []
    },
    temColor: '',
    Temp: '',
    isMeasure: false,
    mearsurePart: 1,
    historyData: [],
    patientId: '',
    spin: false,        //patientId后面的刷新按钮是否旋转
    petName: '',
    notes: '',
    addpatient_petName: '',
    addpatient_description: '',
    addpatient_species: 1,
    roomTemperature: '',
    referenceRectalTemperature: '',
    bodyConditionScore: '',
    furLength: '',
    bodyType: '',
    heartRate: '',
    bloodPressure: '',
    respiratoryRate: '',
    visible: false,       //nodel框是否显示
    disabled: true,       //model是否可拖拽
    bounds: { left: 0, top: 0, bottom: 0, right: 0 },

    leftStatus: 3,         //1代表着有宠物信息，2代表着添加宠物信息，3代表着初始化，没有填入patientId

    selectPet: {
      petId: '',
      petName: '',
      owner: '',
      breedName: '',
      isMix: false,
      age: '',
      weight: '',
      birthday: ''
    },
    units: '℃',
    measuerStatus: 'disconnected',
    isconnected: false,
    countdown: 60,
    isPetCharacteristics: true,
    isEmergency: false,
    seleceEmergencies: {},
    emerPatientID: '',
    emerData: [],

  }

  componentDidMount () {
    ipcRenderer.send('big')
    // ipcRenderer.send('measure')
    if (this.props.location.participate) {
      let props = this.props.location.participate
      console.log(props);
      this.setState({
        patientId: props.patientId
      }, () => {
        this._getPetInfo()
      })
    }
    //获取串口信息
    initTime = new Date()

    getSerialTime = setInterval(() => {
      // console.log('进入定时器');

      ipcRenderer.send('getSerialPort')
    }, 2500);
    // ipcRenderer.send('getSerialPort')
    //这里做了个监听，当有数据发过来的时候直接在这里接收
    ipcRenderer.on('sned', this._send)
    //检测有没有充电桩、温度计
    ipcRenderer.on('SerialResult', this._serialResult)
    //刚进入测量界面需要获取以前的历史数据，测量一次就添加一个记录
    // this._getHistory()
  }

  componentWillUnmount () {
    ipcRenderer.removeListener('sned', this._send)
    ipcRenderer.removeListener('SerialResult', this._serialResult)
    clearInterval(detectTimer)
    detectTimer && clearInterval(detectTimer)
    countdownTimer && clearInterval(countdownTimer)
    getSerialTime && clearTimeout(getSerialTime)
    lastConnectionTime = null;
  }

  _send = (event, data) => {
    //data就是测量的数据，是十进制的数字
    console.log('主进程发来的数据', data);
    this.command(data)()
  }

  _serialResult = (event, data) => {
    // console.log(event, data);

    // console.log(num);

    if (data === false) {

      if (num++ >= 1) {
        num = 0
        message.error('No mella charging station detected')
      }

    } else {
      num = 0
      // console.log(new Date() - initTime);
      if (new Date() - initTime < 4000) {
        const time = setTimeout(() => {
          ipcRenderer.send('num', { command: '07', arr: [] })
          clearTimeout(time)
        }, 1000)

        const time1 = setTimeout(() => {
          ipcRenderer.send('num', { command: '07', arr: [] })
          clearTimeout(time1)
        }, 2000)

      }
      return
      clearTimeout(getSerialTime)
      console.log('检测到了充电桩了');
      lastConnectionTime = new Date() - 3000
      //有充电桩，获取硬件的配置设置
      detectTimer && clearInterval(detectTimer)
      // ipcRenderer.send('num', { command: '1A', arr: ['23', '45'] })

      detectTimer = setInterval(() => {
        let now = new Date()
        //检测有没有测量
        console.log(now - lastConnectionTime, (now - lastConnectionTime > 1622195098671));
        if (now - lastConnectionTime > 1000) {
          ipcRenderer.send('num', { command: '07', arr: [] })


          //这时候也可以理解为停止测量了

          if (now - lastConnectionTime > 2000) {
            if (++disconnectedNum >= 2) {
              console.log('---------------', disconnectedNum);
              disconnectedNum = 0
              this.setState({
                // measuerStatus: 'disconnected',
                countdown: 60,
                isMeasure: false,
                isconnected: false,
                echarsData: {
                  Eci: [],
                  wen0: [],
                  wen1: []
                },
                Temp: '',
                emerData: []
              })
              echartCi = 0
            }


          } else {
            disconnectedNum = 0
          }
          if (now - lastConnectionTime > 10000) {
            lastConnectionTime = new Date() - 6000
            console.log('我到这里了');
            detectTimer && clearInterval(detectTimer)
            ipcRenderer.send('getSerialPort')
          }
        }


      }, 2000);



    }
  }

  /**------------------顶部start------------------------ */
  _close = () => {
    let ipcRenderer = window.electron.ipcRenderer
    console.log('关闭程序');
    ipcRenderer.send('window-close')
  }

  _min = () => {
    let ipcRenderer = window.electron.ipcRenderer
    console.log('最小化程序');
    ipcRenderer.send('window-min')
    this.setState({
      minbgc: '',
    })
  }

  _minMove = () => {

    this.setState({
      minbgc: 'rgb(211, 205, 205)'
    })
  }

  _minLeave = () => {
    this.setState({
      minbgc: ''
    })
  }

  _closeMove = () => {
    this.setState({
      closeColor: 'red',
      closebgc: '#fff'
    })
  }

  _closeLeave = () => {
    this.setState({
      closeColor: '#fff',
      closebgc: ''
    })
  }

  getOption = () => {
    let { units } = this.state
    let min, max;
    if (units === '℃') {
      min = 25
      max = 45
    } else {
      min = 75
      max = 115
    }
    let option = {
      color: ['#81b22f'],
      xAxis: {
        name: 'sec',
        type: 'category',
        // data: ["", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,],
        data: this.state.echarsData.Eci,
        // data:['','15miao','30miao'],
        axisLine: {
          lineStyle: {
            // 设置x轴颜色
            color: '#A0A0A0',
            show: true
          }
        },
        // 设置X轴数据旋转倾斜
        axisLabel: {
          rotate: 0, // 旋转角度
          interval: 49  //设置X轴数据间隔几个显示一个，为0表示都显示

        },

      },
      yAxis: {
        type: 'value',
        min, // 设置y轴刻度的最小值
        max,  // 设置y轴刻度的最大值
        splitNumber: 0,  // 设置y轴刻度间隔个数

        axisLine: {
          lineStyle: {
            // 设置x轴颜色
            color: '#A0A0A0',
            show: true
          }
        },
        splitLine: {
          show: false
        }
      },
      series: [{
        name: '模拟数据',
        type: 'line',
        showSymbol: false,
        hoverAnimation: false,
        // data: [44, 40, 34, 29, 31, 33, 39, 39, 33, 25, 26, 32, 38, 39, 25, 30, 37],
        data: this.state.echarsData.wen0,
        smooth: 0.5,
        symbol: 'none',
        itemStyle: {
          normal: {
            lineStyle: {        // 系列级个性化折线样式 
              width: 2,
              type: 'solid',
              color: {
                type: 'linear',
                x: 0,
                y: 1,
                x2: 0,
                y2: 0,
                colorStops: [{
                  offset: 0.5, color: '#47C2ED' // 0% 处的颜色  蓝
                }, {
                  offset: 1, color: '#78D35D' // 50% 处的颜色  绿
                },
                  // {
                  //   offset: 1, color: 'red' // 100% 处的颜色   红
                  // }
                ],
                globalCoord: false // 缺省为 false
              }
            },
          }
        }
      }]
    }
    return option;
  }

  handleClick = e => {
    switch (e.key) {
      case '1': this.props.history.goBack()
        break;
      case '2': this.props.history.push('/')
        break;
      case '3': this.props.history.push('page12')
        break


    }

  };

  command = (newArr) => {
    const instruction = [209, 193, 192, 129, 135, 238, 98, 97, 130, 208]
    const commandArr = {
      209: () => {  //腋温
        let dataArr1 = newArr.map(item => {
          if (item.toString(16).length < 2) {
            return '0' + item.toString(16)
          } else {
            return item.toString(16)
          }
        })
        if (this.state.isMeasure === false) {
          this.setState({
            echarsData: {
              Eci: [],
              wen0: [],
              wen1: []
            }
          })
          echartCi = 0
          if (countdownTimer) {
            this.setState({
              countdown: 60
            })
          }

          countdownTimer = setInterval(() => {
            let { countdown, isconnected } = this.state
            this.setState({
              countdown: countdown - 1

            })
            if (countdown <= 1) {
              clearInterval(countdownTimer)
              console.log('我要去发送了');
              ipcRenderer.send('num', { command: '41', arr: [] })
            }
            if (isconnected === false) {
              clearInterval(countdownTimer)
              // this.setState({
              //   countdown: 0
              // })
            }
          }, 1000);
        }
        lastConnectionTime = new Date();
        disconnectedNum = 0

        //现在探头0可能不存在，所以把探头0改为探头1
        let temp1 = parseFloat(`${dataArr1[3]}.${(dataArr1[4])}`)
        let temp0 = parseFloat(`${dataArr1[5]}.${(dataArr1[6])}`)
        let temp2 = parseFloat(`${dataArr1[7]}.${(dataArr1[8])}`)
        let pdt0 = parseFloat(`${dataArr1[9]}.${(dataArr1[10])}`)
        let pdt1 = parseFloat(`${dataArr1[11]}.${(dataArr1[12])}`)
        let alpha0 = parseFloat(`${dataArr1[13]}.${(dataArr1[14])}`)
        let alpha1 = parseFloat(`${dataArr1[15]}.${(dataArr1[16])}`)
        let Temp = Math.floor(temp0 * 10) / 10
        console.log('--------------------------', Temp);

        let emerData = this.state.emerData

        let str = {
          data0: temp0,
          data1: temp1,
          data2: temp2,
          pdt0,
          pdt1,
          Alpha0: alpha0,
          Alpha1: alpha1,
        }
        emerData.push(str)
        this.setState({
          emerData
        })

        let { echarsData } = this.state
        let { wen0, wen1, Eci } = echarsData
        Eci.push((echartCi++) / 10)
        if (Temp >= 25) {
          if (this.state.units === '℃') {
            wen0.push(temp0)
            wen1.push(temp1)

            // wen0.push(temp0 * 1.8 + 32)
            // wen1.push(temp1 * 1.8 + 32)
          } else {
            wen0.push(temp0 * 1.8 + 32)
            wen1.push(temp1 * 1.8 + 32)
          }
          this.setState({
            Temp,
            echarsData,
            isMeasure: true,
            mearsurePart: 1,
            measuerStatus: 'connented',
            isconnected: true
          }, () => {
            const option = this.getOption();
            this.echartsElement.getEchartsInstance().setOption(option)  // 实时改变
          })
        }




      },
      208: () => {  //肛温
        let dataArr1 = newArr.map(item => {
          if (item.toString(16).length < 2) {
            return '0' + item.toString(16)
          } else {
            return item.toString(16)
          }
        })

        lastConnectionTime = new Date();
        disconnectedNum = 0

        //现在探头0可能不存在，所以把探头0改为探头1

        let temp0 = parseFloat(`${dataArr1[7]}.${(dataArr1[8])}`)


        let Temp = Math.floor(temp0 * 10) / 10
        console.log('------------gangwen--------------', Temp);

        let emerData = this.state.emerData

        let str = {
          data0: temp0,

        }
        emerData.push(str)
        this.setState({
          emerData,
          Temp,
          isMeasure: false,
          mearsurePart: 3,
          measuerStatus: 'connented',
          isconnected: true
        })

      },
      193: () => {  //硬件发送结束命令
        let time = new Date() - is193Time
        console.log(time);
        if (time < 100) {
          is193Time = new Date()
          console.log('我直接抛出');
          return;
        } else {
          console.log('---------------------------', time);
          is193Time = new Date()

          countdownTimer && clearInterval(countdownTimer)

          this.setState({
            isMeasure: false
          })
          lastConnectionTime = new Date();
          disconnectedNum = 0
          if (saveHistoryTime != null) {
            clearTimeout(saveHistoryTime)
          }
          if (this.state.selectPet.petId !== '' && this.state.isEmergency === false) {
            saveHistoryTime = setTimeout(() => {
              let { roomTemperature, referenceRectalTemperature, bodyConditionScore,
                furLength, heartRate, bloodPressure, respiratoryRate, Temp } = this.state
              if (bodyConditionScore === '') {
                bodyConditionScore = null
              } else {
                bodyConditionScore = parseFloat(bodyConditionScore)
              }

              if (heartRate === '') {
                heartRate = null
              } else {
                heartRate = parseFloat(heartRate)
              }

              if (respiratoryRate === '') {
                respiratoryRate = null
              } else {
                respiratoryRate = parseFloat(respiratoryRate)
              }

              if (roomTemperature === '') {
                roomTemperature = null
              } else {
                roomTemperature = ((parseFloat(roomTemperature) - 32) / 1.8).toFixed(2)
              }

              if (referenceRectalTemperature === '') {
                referenceRectalTemperature = null
              } else {
                referenceRectalTemperature = ((parseFloat(referenceRectalTemperature) - 32) / 1.8).toFixed(2)
              }

              if (furLength === '') {
                furLength = null
              } else {
                furLength = parseFloat(furLength)
              }
              let datas = {
                petId: this.state.selectPet.petId,
                userId: storage.userId,              //后期要录入真实的数据
                temperature: parseFloat(Temp),  //测量温度
                roomTemperature,//室温
                bodyConditionScore,
                heartRate,
                respiratoryRate,
                referenceRectalTemperature,
                furLength,
                bloodPressure,
                memo: this.state.notes,
                petVitalTypeId: this.state.mearsurePart,
                doctorId: storage.userId,
                clinicalDataEntityList: this.state.emerData
              }
              console.log('温度数据保存入参：', datas);
              //把数据保存进入云端
              fetchRequest(`/clinical/addAllClinical/${storage.userId}`, 'POST', datas)
                .then(res => {
                  console.log(res);
                  if (res.flag === true) {
                    console.log('上传成功');
                    // message.success('Uploaded successfully')
                    this.setState({
                      emerData: []
                    })
                    this._getHistory11(this.state.selectPet.petId)
                  } else {
                    console.log('上传失败');
                    this.setState({
                      emerData: []
                    })
                    message.error('upload failed')
                  }
                })
                .catch(err => {
                  console.log(err);
                  message.error(err)
                  this.setState({
                    emerData: []
                  })
                })

              clearTimeout(saveHistoryTime)
            }, 500);

            let { roomTemperature, referenceRectalTemperature, bodyConditionScore,
              furLength, heartRate, bloodPressure, respiratoryRate, Temp } = this.state
            if (bodyConditionScore === '') {
              bodyConditionScore = null
            } else {
              bodyConditionScore = parseFloat(bodyConditionScore)
            }

            if (heartRate === '') {
              heartRate = null
            } else {
              heartRate = parseFloat(heartRate)
            }

            if (respiratoryRate === '') {
              respiratoryRate = null
            } else {
              respiratoryRate = parseFloat(respiratoryRate)
            }

            if (roomTemperature === '') {
              roomTemperature = null
            } else {
              roomTemperature = ((parseFloat(roomTemperature) - 32) / 1.8).toFixed(2)
            }

            if (referenceRectalTemperature === '') {
              referenceRectalTemperature = null
            } else {
              referenceRectalTemperature = ((parseFloat(referenceRectalTemperature) - 32) / 1.8).toFixed(2)
            }

            if (furLength === '') {
              furLength = null
            } else {
              furLength = parseFloat(furLength)
            }




            let datas = {
              userId: storage.userId,              //后期要录入真实的数据
              temperature: parseFloat(Temp),  //测量温度
              roomTemperature,//室温
              bodyConditionScore,
              heartRate,
              respiratoryRate,
              referenceRectalTemperature,
              furLength,
              bloodPressure,
              memo: this.state.notes,
              petVitalTypeId: this.state.mearsurePart,
              doctorId: storage.userId,
              clinicalDataEntityList: this.state.emerData
            }
            console.log('温度数据保存入参：', datas);

            fetchRequest(`/clinical/addAllClinical/${storage.userId}`, 'POST', datas)
              .then(res => {
                console.log(res);
                if (res.flag === true) {
                  console.log('上传成功');
                  message.success('Uploaded successfully')
                  this.setState({
                    emerData: []
                  })
                  // this._getHistory11(this.state.selectPet.petId)
                  this._getEmergencyHistory()
                } else {
                  console.log('上传失败');
                  message.error('upload failed')
                  this.setState({
                    emerData: []
                  })
                }
              })
              .catch(err => {
                console.log(err);
                message.error(err)
                this.setState({
                  emerData: []
                })
              })
          }
        }


      },

      192: () => {   //开始测量返回结果
        switch (newArr[3]) {
          case 90: console.log('有探头，开始测量的返回指令·'); break;
          case 11: console.log('没有探头，开始测量的返回值'); break;

        }
      },
      129: () => {      //返回硬件版本号
        console.log(`返回的版本号为${newArr[3]}`);
        lastConnectionTime = new Date();
        this.setState({
          measuerStatus: 'connented',
          isconnected: true

        })
        disconnectedNum = 0
      },
      135: () => {          //硬件的一些配置信息
        /**
         * ______________新版、旧版没法控制温度计__________________
         * newArr[3]、newArr[4]、newArr[5]、newArr[6]是蓝牙温度计的修正系数
         * newArr[7] 无操作关机时间        bcd码
         * newArr[8] 背光时间              bcd码
         * newArr[9] 是否提示音    ：00代表无提示音，11代表有提示音
         * newArr[10] 测量单位    01代表℃，00代表℉
         */
        countdownTimer && clearInterval(countdownTimer)
        lastConnectionTime = new Date();
        this.setState({
          measuerStatus: 'connented',
          isconnected: true

        })
        disconnectedNum = 0

        if (newArr.length === 13) {
          console.log('这种能改变单位');
          if (newArr[10] === 0) {
            console.log('这是℉');
            this.setState({
              units: '℉'
            })
          } else {
            this.setState({
              units: '℃'
            })
            console.log('这是℃');
          }
        }
      },
      238: () => {     //探头松动
        console.log('探头松动');
        this.setState({
          isMeasure: false
        })
        message.error('The probe is loose, please re-install and measure again', 5)
        clearInterval(countdownTimer)
      },
      98: () => { //蓝牙连接断开
        console.log('断开连接---断开连接---断开连接---断开连接---断开连接---断开连接');


        console.log(new Date() - is97Time);
        if (new Date() - is97Time < 800) {
          return
        }
        this.setState({
          // measuerStatus: 'disconnected',
          countdown: 60,
          isMeasure: false,
          isconnected: false,
          echarsData: {
            Eci: [],
            wen0: [],
            wen1: []
          },
          Temp: '',
          emerData: []
        })
        echartCi = 0

      },
      97: () => {       //蓝牙连接
        console.log('连接成功---连接成功---连接成功---连接成功---连接成功---连接成功');
        disconnectedNum = 0
        lastConnectionTime = new Date();
        this.setState({
          measuerStatus: 'connented',
          isconnected: true

        })
        is97Time = new Date()
      },
      130: () => {   //获取到mac地址
        let dataArr = newArr.map(item => {
          if (item.toString(16).length < 2) {
            return '0' + item.toString(16)
          } else {
            return item.toString(16)
          }
        })
        let str = ''
        for (let i = 3; i < dataArr.length - 2; i++) {

          str += dataArr[i]

        }
        // console.log(str);
        this.setState({
          notes: `${str}
          `
        })
      }
    }
    if (instruction.indexOf(newArr[2]) !== -1) {
      return commandArr[newArr[2]]
    } else {
      return () => {
        console.log('没有控制命令', commandArr);
      }
    }

  }

  _mearsurePort = () => {
    switch (this.state.mearsurePart) {
      case 1: return (
        <div >
          <div className='part'>
            Axillary
            <img src={ye} alt="" width="50px" />

          </div>
        </div>
      );
      case 2: return null;
      default: return null;
    }
  }

  _getEmergencyHistory = () => {

    //封装的日期排序方法
    function ForwardRankingDate (data, p) {
      for (let i = 0; i < data.length - 1; i++) {
        for (let j = 0; j < data.length - 1 - i; j++) {
          if (Date.parse(data[j][p]) < Date.parse(data[j + 1][p])) {
            var temp = data[j];
            data[j] = data[j + 1];
            data[j + 1] = temp;
          }
        }
      }
      return data;
    }
    let historys = []
    fetchRequest(`/pet/getPetExamByDoctorId/${storage.userId}`, 'GET', '')  //userID要自动的
      .then(res => {
        if (res.flag === true) {
          let datas = res.data
          for (let i = datas.length - 1; i >= 0; i--) {
            if (datas[i].petId === null) {
              let { petId, examId, userId, petVitalTypeId, temperature, roomTemperature, bloodPressure, memo, clinicalDatagroupId,
                bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, createTime, clinicalDataEntity } = datas[i]
              let Tem = temperature || clinicalDataEntity.data0


              let str = {
                clinicalDatagroupId,
                createTime,
                date: moment(createTime).format('MMM DD'),
                time: moment(createTime).format('hh:mm A'),
                temp: parseInt(Tem * 10) / 10,
                placement: petVitalTypeId,
                note: memo,
                historyId: examId,
                bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId
              }

              historys.push(str)
            }
          }

          //把所有数据拿完后做个排序

          let historyData = ForwardRankingDate(historys, "createTime");
          console.log('historyData:', historyData);
          this.setState({
            historyData
          })
        }
      })
      .catch(err => {
        console.log(err);
      })

  }

  _getHistory11 = (petId) => {
    let historys = []
    fetchRequest(`/pet/getPetExamAndClinicalByPetId/${petId}`, 'GET', '')  //userID要自动的
      .then(res => {
        console.log(res);
        if (res.flag === true) {
          let datas = res.data
          console.log('-------', datas);
          for (let i = datas.length - 1; i >= 0; i--) {

            let data = datas[i]

            let { petId, examId, userId, petVitalTypeId, temperature, roomTemperature, bloodPressure, memo,
              bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, createTime, clinicalDataEntity, modifiedTime } = data
            let Tem = temperature
            if (clinicalDataEntity) {
              Tem = Tem || clinicalDataEntity.data0
            }
            Tem = Tem.toFixed(1)
            console.log('--------', modifiedTime);
            let time = null
            if (modifiedTime && `${modifiedTime}` !== '' && `${modifiedTime}` !== `undefined`) {
              time = modifiedTime
            } else {
              time = createTime
            }
            let json = {
              time,
              Temp: Tem,
              placement: petVitalTypeId,
              note: memo,
              historyId: examId,
              bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId
            }
            historys.push(json)


          }
          console.log('---', historys);
          let historyData = []
          for (let i = 0; i < historys.length; i++) {
            let history = historys[i]
            let { bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId, examId } = history
            // console.log('--------', history.placement);
            let placement = history.placement
            if (placement === null || placement === '') {
              placement = 1
            }
            let str = {
              date: moment(history.time).format('MMM DD'),
              time: moment(history.time).format('hh:mm A'),
              temp: history.Temp,
              placement,
              note: history.note,
              historyId: history.historyId,
              bodyConditionScore, heartRate, respiratoryRate, referenceRectalTemperature, furLength, roomTemperature, bloodPressure, petId, userId,
              key: examId
            }
            historyData.push(str)
          }
          console.log('historyData:', historyData);
          this.setState({
            historyData
          })
        }
      })
      .catch(err => {
        console.log(err);
      })

  }

  _refresh = () => {
    console.log('点击了');
    // ipcRenderer.send('num', { command: '07', arr: [] })
    this.setState({
      spin: true,  //
      addpatient_description: '',
      addpatient_petName: '',
      addpatient_species: 1
    })
    if (this.state.patientId === '') {
      this.setState({
        spin: false
      })
    } else {
      this._getPetInfo()
    }


  }

  _getPetInfo = () => {
    let datas = {
      patientId: this.state.patientId
    }

    console.log('入参：', datas);
    fetchRequest('/pet/getPetInfoByPatientIdAndPetId', 'POST', datas)
      .then(res => {
        console.log(res);
        this.setState({
          spin: false
        })
        if (res.flag === true) {
          //有宠物，进入1
          let { petId, petName, lastName, firstName, breedName, isMix, birthday, weight, url } = res.data[0]
          if (isMix !== true) {
            isMix = false
          }
          let age = moment(new Date()).diff(birthday, 'year')
          let selectPet = {
            petId,
            petName,
            owner: `${lastName}  ${firstName}`,
            breedName,
            isMix,
            age,
            weight,
            birthday,
            url

          }
          this.setState({
            selectPet,
            leftStatus: 1,
          })
          this._getHistory11(petId)

        } else {
          //没有宠物，进入2
          this.setState({
            leftStatus: 2
          })
        }
      })
      .catch(err => {
        this.setState({
          spin: false
        })
        console.log(err);
      })

  }

  draggleRef = React.createRef();

  showModal = () => {
    this.setState({
      visible: true
    });
  };

  handleOk = (e) => {
    console.log(e);
    this.setState({
      visible: false,
      emerPatientID: ''
    });
  };

  handleCancel = (e) => {
    console.log(e);
    this.setState({
      visible: false,
      emerPatientID: ''
    });
  };

  onStart = (event, uiData) => {
    const { clientWidth, clientHeight } = window?.document?.documentElement;
    const targetRect = this.draggleRef?.current?.getBoundingClientRect();
    this.setState({
      bounds: {
        left: -targetRect?.left + uiData?.x,
        right: clientWidth - (targetRect?.right - uiData?.x),
        top: -targetRect?.top + uiData?.y,
        bottom: clientHeight - (targetRect?.bottom - uiData?.y)
      }
    });
  };

  _addPatient = () => {
    console.log(222);
    let { addpatient_description, addpatient_petName, addpatient_species, patientId } = this.state
    let speciesId = 3
    if (addpatient_species === 1) {
      speciesId = 2
    }
    switch (addpatient_species) {
      case 1: speciesId = 2; break;
      case 2: speciesId = 1; break;
      default: speciesId = 3
    }
    let datas = {

      petName: addpatient_petName,
      description: addpatient_description,
      speciesId
    }
    console.log(datas);
    fetchRequest(`/pet/addDeskPet/${patientId}`, 'POST', datas)
      .then((res) => {
        console.log(res);
        if (res.flag === true) {
          message.success('Patient id created successfully')
          this._refresh()
        } else {
          console.log('创建Patient id 失败');
          message.error('Patient id creation failed')
        }
      })
      .catch(err => {
        console.log(err);
        message.error('Patient id creation failed')
      })
  }

  _topLeft = () => {
    let { historyData, spin, selectPet, patientId } = this.state
    let { petName, owner, breedName, isMix, age, weight, url } = selectPet

    let image = other
    if (`${url}` !== 'null') {
      image = `${url}?download=0&width=80`
    }

    if (breedName === null) {
      breedName = ''
    }
    let mix = ''
    if (isMix === true) {
      mix = 'Mix'
    }
    if (weight === null) {
      weight = 'unknown'
    } else {
      weight = (2.2046 * parseFloat(weight)).toFixed(1)
    }

    if (`${age}` === `NaN` || `${age}` === `null`) {
      age = 'unknown'
    }
    let datas = []
    for (let i = 0; i < historyData.length; i++) {
      if (i < 3) {
        datas.push(historyData[i])
      } else {
        break;
      }
    }
    let dogbgc = '', catbgc = '', otherbgc = '';

    switch (this.state.addpatient_species) {
      case 1: dogbgc = '#E1206D'; catbgc = '#F08FB6'; otherbgc = '#F08FB6'; break;
      case 2: dogbgc = '#F08FB6'; catbgc = '#E1206D'; otherbgc = '#F08FB6'; break;
      case 3: dogbgc = '#F08FB6'; catbgc = '#F08FB6'; otherbgc = '#E1206D'; break;
    }

    if (owner === `null  null`) {
      owner = 'unknown'
    }
    if (breedName === '' || breedName === null || breedName === undefined) {
      breedName = 'unknown'
    }

    switch (this.state.leftStatus) {
      case 1: return (
        <div className="l">
          <div className="petinfo">
            <div className="heard">
              <Tooltip placement='bottom' title='Switch pet'>
                <MyIcon
                  type='icon-qiehuanchengshi'
                  className="icon"
                  style={{ marginRight: '30px' }}
                  onClick={() => {
                    this.setState({
                      leftStatus: 3,
                      isMeasure: false,
                      selectPet: {
                        petId: '',
                        petName: '',
                        owner: '',
                        breedName: '',
                        isMix: false,
                        age: '',
                        weight: '',
                        birthday: '',
                      },
                      patientId: '',
                      historyData: [],
                    })
                  }} />
              </Tooltip>

              <div className='avatar' style={{ backgroundImage: `url(${image})` }}>
                {/* {(`${url}` === 'null') ?
                  (<img src={other} width={'80px'} />) :
                  (<img src={`${url}?download=0&width=80`} height={'80px'} style={{ borderRadius: '200px' }} />
                )} */}

                <img className='edit' src={edit} alt="" width='18px'
                  onClick={() => {
                    this.props.history.push({ pathname: '/page9', participate: { patientId, petName } })
                  }}

                />
              </div>
              {`ID:${patientId}, ${petName}`}
            </div>

            <div className="info">
              Owner: {`${owner}`} <br />
              {`Breed: ${breedName}  ${mix}`}<br />
              Age: {`${age}`} yrs<br />
              Weight: {`${weight}`} lbs<br />
            </div>
          </div>
          <div className="history">
            <div className="heard1" onClick={() => { this.setState({ visible: true }) }}>
              <span>Device Info</span>
            </div>
            <div className="historyBody">
              <div className="devices">
                <p>Device:</p>
                <Select defaultValue="Mella-684h2" style={{ width: 120 }} size={'small'}
                // onChange={handleChange}
                >
                  <Option value="device1">Mella-684h2</Option>
                  <Option value="device2">Mella-587j0</Option>
                  <Option value="device3">Mella-742k3</Option>
                </Select>
              </div>
              {this._mearsurePort()}
            </div>

          </div>
        </div>
      )

      case 2: return (
        <div className="l">
          <div className="petinfo">
            <div className="heard">
              {`Clinical Study Mode`}
            </div>
            <div className="patirntID">
              <p style={{ width: '80px' }}>Patient ID:</p>
              <Input
                style={{ border: 'none', outline: 'medium' }}
                value={this.state.patientId}
                bordered={false}
                onChange={(item) => {
                  console.log(item);
                  this.setState({
                    patientId: item.target.value
                  })
                }}
                onKeyDown={(e) => {
                  // console.log('------', e);
                  if (e.keyCode === 13) {
                    this._refresh()
                  }
                }}
              />
              <SyncOutlined className='refresh' onClick={this._refresh} spin={spin} />
            </div>

            <div className='newPet'>
              <p style={{ color: '#E1206D', fontSize: '13px', fontWeight: 'bold', marginTop: '10px', paddingLeft: '30px' }}>Yay! You got a new patient!</p>
              <div className="patirntID">
                <p style={{ width: '80px' }}>Pet Name:</p>
                <Input
                  style={{ border: 'none', outline: 'medium' }}
                  value={this.state.addpatient_petName}
                  bordered={false}
                  onChange={(item) => {
                    // console.log(item);
                    this.setState({
                      addpatient_petName: item.target.value
                    })
                  }}
                />
              </div>
              <div className="patirntID">
                <p style={{ width: '80px' }}>Description:</p>
                <Input
                  style={{ border: 'none', outline: 'medium' }}
                  value={this.state.addpatient_description}
                  bordered={false}
                  onChange={(item) => {
                    // console.log(item);
                    this.setState({
                      addpatient_description: item.target.value
                    })
                  }}
                />
              </div>
              <div className="species">

                <ul>
                  <li >
                    <div className='speciesChild' >
                      <div className='dog' onClick={() => { this.setState({ addpatient_species: 1 }) }} style={{ backgroundColor: dogbgc }}>
                        <img src={dog} alt="" style={{ width: '38px' }} />
                      </div>
                      Dog
                    </div>
                  </li>
                  <li >
                    <div className='speciesChild' >
                      <div className='dog' onClick={() => { this.setState({ addpatient_species: 2 }) }} style={{ backgroundColor: catbgc }} >
                        <img src={cat} alt="" style={{ width: '38px' }} />
                      </div>
                      Cat
                    </div>
                  </li>
                  <li >
                    <div className='speciesChild' >
                      <div className='dog' onClick={() => { this.setState({ addpatient_species: 3 }) }} style={{ backgroundColor: otherbgc }}>
                        <img src={other} alt="" style={{ width: '32px', color: '#FFF' }} />
                      </div>
                      Other
                    </div>
                  </li>
                </ul>
              </div>
              <div className="savebtn">
                <p onClick={() => { this._addPatient() }}>Add New Patient</p>
              </div>
            </div>
          </div>
        </div>
      )
      case 3: return (
        <div className="l">
          <div className="petinfo">
            <div className="heard">
              {`Clinical Study Mode`}
            </div>
            <div className="patirntID">
              <p style={{ width: '80px' }}>Patient ID:</p>
              <Input
                style={{ border: 'none', outline: 'medium' }}
                value={this.state.patientId}
                bordered={false}
                onChange={(item) => {
                  // console.log(item);
                  this.setState({
                    patientId: item.target.value
                  })
                }}
                onKeyDown={(e) => {
                  // console.log('------', e);
                  if (e.keyCode === 13) {
                    this._refresh()
                  }
                }}
              />
              <SyncOutlined className='refresh' onClick={this._refresh} spin={spin} />
            </div>
            <div className="emergency" onClick={() => {
              this.setState({ leftStatus: 4, isEmergency: true })
              this._getEmergencyHistory()
            }}>
              <div className="btn">
                Emergency
              </div>
            </div>
          </div>
        </div>
      )
      case 4: return (
        <div className="l">
          <div className="petinfo">
            <div className="heard">
              {`Clinical Study Mode`}
            </div>
            <div className="emergencyText">
              <p style={{}}>
                You are in an emergency now,
                you can click History in this mode to assign history records</p>

            </div>
            <div className="emergency" onClick={() => {
              this.setState({ leftStatus: 3, isEmergency: false, historyData: [] })

            }}>
              <div className="btn">
                Exit emergency
              </div>
            </div>

            <div className="history">
              <div className="heard1" onClick={() => { this.setState({ visible: true }) }}>
                <span>Device Info</span>
              </div>
              <div className="historyBody">
                <div className="devices">
                  <p>Device:</p>
                  <Select defaultValue="Mella-684h2" style={{ width: 120 }} size={'small'}
                  // onChange={handleChange}
                  >
                    <Option value="device1">Mella-684h2</Option>
                    <Option value="device2">Mella-587j0</Option>
                    <Option value="device3">Mella-742k3</Option>
                  </Select>
                </div>
                {this._mearsurePort()}
              </div>

            </div>
          </div>
        </div>
      )
    }


  }

  handleChange = index => {
    console.log('---------', index);
    this.setState({
      furLength: index
    })
  };

  handleChange1 = index => {
    console.log('---------', index);
    let bodyType = document.querySelectorAll('#_bodyType .ant-select-selector')
    switch (`${index}`) {
      case '1': bodyType[0].style.width = "105px"

        break;
      case '2': bodyType[0].style.width = "130px"

        break;
      case '3': bodyType[0].style.width = "120px"

        break;

      default: bodyType[0].style.width = "105px"
        break;
    }

    // bodyType[0].style.width = "120px"
    console.dir(bodyType)
    this.setState({
      bodyType: index
    })
  };

  _foot = () => {

    let { furLength, bodyType } = this.state

    const _del = (key, record) => {
      console.log('删除', key, record);


      /**------------这里还要删除后台的数据------------ */
      fetchRequest(`/pet/deletePetExamByExamId/${key}`, 'DELETE')
        .then(res => {
          if (res.flag === true) {
            console.log('删除成功');
            const historyData = [...this.state.historyData];
            console.log(historyData);
            this.setState({
              historyData: historyData.filter((item) => item.historyId !== key)
            });
          } else {
            console.log('删除失败');
          }
        })
    }

    const columns = [
      {
        title: '',
        dataIndex: 'operation',
        key: 'operation',
        render: (text, record, index) => {
          // console.log('狩猎:', text, record, index);
          //record:
          return (
            <div style={{ width: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center', }} >
              <Popconfirm title="Sure to delete?" onConfirm={() => _del(record.historyId, record)}>
                <img src={del} alt="" style={{ marginRight: '8px' }} />
              </Popconfirm>
              {
                (this.state.isEmergency) ? (
                  <div className="assign" onClick={() => {
                    console.log(text, record, index);
                    this.setState({
                      visible: true,
                      seleceEmergencies: record
                    })
                  }}>Assign</div>
                ) : (
                  <img src={edit} alt=""
                  // onClick={() => _edit(record)} 
                  />
                )
              }

            </div>
          )

        }
      },
      {
        title: 'Date',
        dataIndex: 'date',
        key: 'date',
        render: (text, record, index) => {

          return (
            <p style={{ textAlign: 'center' }}>{text}</p>
          )

        }
      },
      {
        title: 'Time',
        dataIndex: 'time',
        key: 'time',
        render: (text, record, index) => {

          return (
            <p style={{ textAlign: 'center' }}>{text}</p>
          )

        }
      },
      {
        title: `Temp(${this.state.units})`,
        key: 'temp',
        dataIndex: 'temp',
        render: (text, record, index) => {
          // console.log(text, record);
          let bag = ''
          if (text > 39) {
            bag = '#E1206D'
          } else if (text < 38) {
            bag = '#98DA86'
          } else {
            bag = '#58BDE6'
          }
          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '8px', backgroundColor: bag, marginRight: '3px' }} />
              <p style={{ margin: 0, padding: 0 }}>{(this.state.units === '℃') ? text : parseInt((text * 1.8 + 32) * 10) / 10} <span>{this.state.units}</span></p>
            </div>
          )

        }
      },
      {
        title: `Rectal Reference Temperature`,
        key: 'referenceRectalTemperature',
        dataIndex: 'referenceRectalTemperature',
        render: (text, record, index) => {

          console.log('----------=============----------', text);
          let num = text
          if (text !== null) {
            num = parseInt((text * 1.8 + 32) * 10) / 10
          }

          return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {text !== null && <p style={{ margin: 0, padding: 0 }}>{num} <span>{'℉'}</span></p>}

            </div>
          )

        }
      },
      {
        title: 'Placement',
        dataIndex: 'placement',
        key: 'placement',
        align: 'center',
        render: (text, record, index) => {
          switch (record.placement) {
            case 1: return (    //腋温
              <div>
                <img src={palcement_ye} alt="" />
              </div>
            )
            case 2: return (    //耳温
              <div>
                <img src={placement_er} alt="" />
              </div>
            )
            case 3: return (     //肛温
              <div>
                <img src={placement_gang} alt="" />
              </div>
            )
            default: return (    //腋温
              <div>
                <img src={palcement_ye} alt="" />
              </div>
            )
          }
          return (
            <p style={{ textAlign: 'center' }}>{text}</p>
          )

        }
      },
      {
        title: 'Note',
        dataIndex: 'note',
        key: 'note',
        render: (text, record, index) => {

          return (
            <p style={{ width: '70px' }}>{text}</p>
          )

        }
      },
    ];



    let placeholder = '', placeholder1 = ''
    switch (`${furLength}`) {
      case '1': placeholder = 'smooth'; break;
      case '2': placeholder = 'short'; break;
      case '3': placeholder = 'medium'; break;
      case '4': placeholder = 'long'; break;
    }

    switch (`${bodyType}`) {
      case '1': placeholder1 = 'small'; break;
      case '2': placeholder1 = 'barrel chested'; break;
      case '3': placeholder1 = 'keel chested'; break;
    }

    let lbgc = '', rbgc = ''
    if (this.state.isPetCharacteristics) {
      lbgc = 'rgba(25,173,228,0.5)'; rbgc = 'rgba(105,201,237,1)'
    } else {
      lbgc = 'rgba(105,201,237,1)'; rbgc = 'rgba(25,173,228,0.5)'
    }

    return (
      <div className="clinical_foot">
        <div className="top">

          <div className="foot_l" style={{ backgroundColor: lbgc }} onClick={() => this.setState({ isPetCharacteristics: true })}>
            Pet Characteristics
          </div>
          <div className="foot_l" style={{ backgroundColor: rbgc }} onClick={() => this.setState({ isPetCharacteristics: false })}>
            History
          </div>
        </div>
        {(this.state.isPetCharacteristics) ? (<div className="petChaeacteristics">
          <div className="child" style={{ marginTop: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <p style={{ width: '150px' }}>Room Temperature: </p>
              <Input className='inp'
                style={{ border: 'none', outline: 'medium' }}
                value={`${this.state.roomTemperature}`}
                bordered={false}
                onChange={(item) => {
                  let str = item.target.value.replace(/[^\d^\.]+/g, '').replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                  this.setState({
                    roomTemperature: str
                  })
                }}
              />
              <span style={{ position: 'absolute', top: "5%", right: '5%', display: 'table-cell', whiteSpace: 'nowrap', paddingTop: '5px', paddingRight: '5px' }}>℉</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <p style={{ width: '150px' }}>Reference Rectal Temperature: </p>
              <Input className='inp'
                style={{ border: 'none', outline: 'medium' }}
                value={`${this.state.referenceRectalTemperature}`}
                bordered={false}
                onChange={(item) => {
                  let str = item.target.value.replace(/[^\d^\.]+/g, '').replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                  this.setState({
                    referenceRectalTemperature: str
                  })
                }}
              />
              <span style={{ position: 'absolute', top: "10%", right: '5%', display: 'table-cell', whiteSpace: 'nowrap', paddingTop: '5px', paddingRight: '5px' }}>℉</span>
            </div>

          </div>
          <div className="child">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <p style={{ width: '150px' }}>Body Condition Score:  </p>
              <Input className='inp'
                style={{ border: 'none', outline: 'medium' }}

                value={this.state.bodyConditionScore}
                bordered={false}
                onChange={(item) => {
                  let str = item.target.value.replace(/[^\d^\.]+/g, '').replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                  this.setState({
                    bodyConditionScore: str
                  })
                }}
              />
            </div>
            <div className='furLength' >
              <p style={{ width: '150px' }}>Fur Length: </p>
              <Select
                showSearch
                placeholder
                onChange={this.handleChange}
                style={{ width: '105px', borderRadius: '40px', height: '33px', outline: 'none', borderWidth: 0 }}
                value={placeholder}
              >
                <Option value="1">smooth</Option>
                <Option value="2">short</Option>
                <Option value="3">medium</Option>
                <Option value="4">long</Option>
              </Select>
            </div>


          </div>
          <div className="child">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', }}>
              <p style={{ width: '150px' }}>Heart Rate:  </p>
              <Input className='inp'
                style={{ border: 'none', outline: 'medium' }}
                value={`${this.state.heartRate}`}
                bordered={false}
                onChange={(item) => {
                  let str = item.target.value.replace(/[^\d^\.]+/g, '').replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                  this.setState({
                    heartRate: str
                  })
                }}

              />
              <span style={{ position: 'absolute', top: "2%", right: '5%', display: 'table-cell', whiteSpace: 'nowrap', paddingTop: '5px', paddingRight: '1px' }}>bpm</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
              <p style={{ width: '150px' }}>Blood Pressure:  </p>
              <Input className='inp'
                style={{ border: 'none', outline: 'medium' }}
                value={this.state.bloodPressure}
                bordered={false}
                onChange={(item) => {
                  let str = item.target.value.replace(/[^\d^\.]+/g, '').replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                  this.setState({
                    bloodPressure: str
                  })
                }}
              />
              <span style={{ position: 'absolute', top: "2%", right: '5%', display: 'table-cell', whiteSpace: 'nowrap', paddingTop: '5px', paddingRight: '5px' }}>mm</span>
            </div>

          </div>
          <div className="child" style={{ marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', }}>
              <p style={{ width: '150px' }}>Respiratory Rate:  </p>
              <Input className='inp'
                style={{ border: 'none', outline: 'medium' }}
                value={`${this.state.respiratoryRate}`}
                bordered={false}
                onChange={(item) => {
                  let str = item.target.value.replace(/[^\d^\.]+/g, '').replace(/\.{2,}/g, ".").replace(".", "$#$").replace(/\./g, "").replace("$#$", ".").replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3')
                  this.setState({
                    respiratoryRate: str
                  })
                }}

              />
              <span style={{ position: 'absolute', top: "2%", right: '5%', display: 'table-cell', whiteSpace: 'nowrap', paddingTop: '5px', paddingRight: '1px' }}>bpm</span>
            </div>
            <div className='furLength' id='_bodyType' >
              <p style={{ width: '150px' }}>Body Type: </p>
              <Select
                showSearch
                placeholder
                onChange={this.handleChange1}
                style={{ borderRadius: '40px', height: '33px', outline: 'none', borderWidth: 0 }}
                value={placeholder1}
                dropdownMatchSelectWidth={120}

              >
                <Option value="1">small</Option>
                <Option value="2">barrel chested</Option>
                <Option value="3">keel chested</Option>
              </Select>
            </div>
          </div>
          <div className="note">
            <p>Notes:</p>
            <textarea
              rows="2"
              cols="30"
              value={this.state.notes}
              onChange={(val) => {
                console.log(val);
                this.setState({
                  notes: val.target.value
                })
              }}

            >
            </textarea>
          </div>

        </div>
        ) : (<Table
          columns={columns}
          dataSource={this.state.historyData}
          rowKey={columns => columns.key}
          pagination={{ pageSize: 3, showSizeChanger: false, showQuickJumper: true }}
        />)}
      </div >
    )
  }


  _status = () => {
    let { closeColor, closebgc, minbgc, units, isMeasure, Temp, measuerStatus, isconnected } = this.state
    let text = '', unit = '', temColor = ''
    Temp = parseFloat(Temp)

    if (isconnected === false) {
      Temp = ''
      text = 'disconnected'
      temColor = '#3B3A3A'
    } else {
      text = 'connected'
      temColor = '#3B3A3A'
      if (Temp > 15) {
        unit = units
        if (Temp > 39) {
          text = 'High'
          temColor = '#E1206D'
        } else if (Temp < 31) {
          text = 'Low'
          temColor = '#47C2ED'

        } else {
          text = 'Normal'
          temColor = '#78D35D'
        }
      }
    }



    let temp = ''

    if (`${Temp}` === 'NaN' || Temp === '') {
      temp = ''
    } else {
      // temp = Temp
      temp = parseInt(Temp * 10) / 10
      if (units === '℉') {

        temp = parseInt((Temp * 1.8 + 32) * 10) / 10

      }
    }

    return (
      <div className='Tem' style={{ color: temColor, }}>

        {(!isMeasure) ? (
          <>
            <span style={{ fontSize: '36px' }}>{temp} <sup style={{ fontSize: '18px' }}>{unit}</sup></span><br />
            <span style={{ fontSize: '22px' }}>{text}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize: '36px' }}>{temp} <sup style={{ fontSize: '18px' }}>{unit}</sup></span><br />

          </>
        )}


      </div>

    )
  }

  render () {
    const { closeColor, closebgc, minbgc } = this.state
    return (
      <div id="clinicalMeasure11">
        {/* 头部 */}
        <div className="close1">
          {/* 菜单 */}
          <div className="menu">
            <Menu
              onClick={this.handleClick}
              selectedKeys={['menu']}
              mode="horizontal"
              theme={'drak'}
            >

              <SubMenu key="SubMenu"
                icon={<MyIcon type='icon-ic_menu_px' className="icon" />}
              >
                <Menu.Item key="1">return</Menu.Item>
                <Menu.Item key="2">home</Menu.Item>
                <Menu.Item key="3">Workplace</Menu.Item>

              </SubMenu>

            </Menu>
          </div>
          <div className="text">mella</div>
          <div className='maxmin'>
            <div
              className="min iconfont icon-64"
              onClick={this._min}
              onMouseEnter={this._minMove}
              onMouseLeave={this._minLeave}
              style={{ backgroundColor: minbgc }}
            ></div>

            <div
              className="max iconfont icon-guanbi2"
              onClick={this._close}
              onMouseEnter={this._closeMove}
              onMouseLeave={this._closeLeave}
              style={{ backgroundColor: closebgc, color: closeColor }}
            ></div>
          </div>


        </div>


        {/* 宠物信息与折线图部分 */}
        <div className='clinical_top'>
          {this._topLeft()}
          <div className="r" >
            <div className="bb">
              <div className="btn"
                onClick={() => {
                  console.log('点击了切换按钮');

                  if (isClick === true) {
                    isClick = false
                    console.log('发送给主进程切换按钮');
                    ipcRenderer.send('qiehuan')
                    // ipcRenderer.send('getSerialPort')
                    const time = setTimeout(() => {
                      isClick = true
                      clearTimeout(time)
                    }, 2500)
                  }

                }}
              >Switch connection method</div>

              {/* <div className="btn"
                onClick={() => {
                  ipcRenderer.send('num', { command: '02', arr: [] })
                }}
              >获取mac地址</div> */}
            </div>

            <div id='myCharts'>
              <ReactECharts
                option={this.getOption()} theme="Imooc" style={{ height: '380px' }}
                notMerge={true}
                lazyUpdate={true}
                theme={"theme_name"}
                ref={(e) => { this.echartsElement = e }}
              />
            </div>

            {this._status()}
            {/* {this._mearsurePort()} */}
            <div className="time">
              {(this.state.isconnected) ? (<p>{`Measurement Timer  ${this.state.countdown} s`}</p>) : null}
            </div>

          </div>
        </div>


        {/* 底部宠物信息 */}
        {this._foot()}
        {this._modal()}
      </div>
    )
  }

  _modal = () => {

    // /*
    //   我用random()生成随机数,用for循环来生成100个数  ，然后求66出现的次数
    //    生成一个 0 - 100 之间的随机整数:parseInt(100*Math.random())
    // */

    // //生成了一百个随机数
    // let arr = []
    // for (let i = 0; i < 100; i++) {
    //   arr.push(parseInt(100 * Math.random()))
    // }

    // let num = 0 //我用num来代表66出现的次数

    // for (let i = 0; i < arr.length; i++) {
    //   if (arr[i] === 66) {
    //     num += 1
    //   }
    // }
    // console.log('出现的次数', num);
    let that = this

    function save () {
      let datas = {
        patientId: that.state.emerPatientID
      }

      console.log('入参：', datas);
      fetchRequest('/pet/getPetInfoByPatientIdAndPetId', 'POST', datas)
        .then(res => {
          console.log(res);
          if (res.flag === true) {
            //有宠物，进入1
            let { petId, } = res.data[0]
            if (petId !== null && petId !== undefined && petId !== '') {
              console.log(petId);

              let parmes = {
                petId,
                clinicalDatagroupId: that.state.seleceEmergencies.clinicalDatagroupId
              }
              fetchRequest(`/pet/addAndSavePetExam/${that.state.seleceEmergencies.historyId}`, 'POST', parmes)
                .then(res => {
                  console.log('----------', res);
                  if (res.flag === true) {
                    console.log('分配成功');
                    message.success('Assigned successfully')
                    that._getEmergencyHistory()
                    that.setState({
                      visible: false,
                      emerPatientID: ''
                    })
                  } else {
                    message.success('Assignment failed')
                  }

                })
                .catch(err => {
                  console.log(err);
                  message.success('Assignment failed')
                })

            }


          } else {
            console.log('没找到');
            message.error('There are no pets under this patientID')
          }
        })
        .catch(err => {
          this.setState({
            spin: false
          })
          console.log(err);
        })

    }


    let { disabled, bounds, visible } = this.state
    return (
      <Modal
        title={
          <div
            style={{
              width: '100%',
              cursor: 'move',
              height: '20px',
              textAlign: 'center'
            }}
            onMouseOver={() => {
              if (disabled) {
                this.setState({
                  disabled: false,
                });
              }
            }}
            onMouseOut={() => {
              this.setState({
                disabled: true,
              });
            }}

            onFocus={() => { }}
            onBlur={() => { }}
          // end
          >
            Distribute the history of emergencies
          </div>
        }
        visible={visible}
        // visible={true}
        onOk={this.handleOk}
        onCancel={this.handleCancel}

        modalRender={(modal) => (
          <Draggable
            disabled={disabled}
            bounds={bounds}
            onStart={(event, uiData) => this.onStart(event, uiData)}
          >
            <div ref={this.draggleRef}>{modal}</div>
          </Draggable>
        )}
        footer={
          [] // 设置footer为空，去掉 取消 确定默认按钮
        }
        destroyOnClose={true}
      >
        <div id="selectEmergenciesModal">
          <div className="selectEmergenciesModal">
            <p style={{ width: '80px' }}>Patient ID</p>
            <Input
              style={{ border: 'none', outline: 'medium' }}
              value={this.state.emerPatientID}
              bordered={false}
              onChange={(item) => {
                this.setState({
                  emerPatientID: item.target.value
                })

              }}
              onKeyDown={(e) => {
                // console.log('------', e);
                if (e.keyCode === 13) {
                  save()
                }
              }}
            />
          </div>
          <div className="btn" onClick={save}>Save</div>
        </div>

      </Modal>






    )

  }

}
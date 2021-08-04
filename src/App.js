import React, { Component } from 'react'
import { BrowserRouter, Switch, Route, HashRouter } from 'react-router-dom'

import Home from './components/home/Home'
import Choose from './components/choose/Choose'
import EzyVetLogin from './components/ezyVetLogin/EzyVetLogin'
import EzyVetSelectTime from './components/ezyVetSelectTime/EzyVetSelectTime'
import SelectMella from './components/selectMella/SelectMella'
import APIkey from './components/apiKey/APIKey'
import VerifyOrganizationInformation from './components/selectLocation/VerifyOrganizationInformation'
import EzyVetSelectExam from './components/ezyVetSelectExam/EzyVetSelectExam'
import Praviders from './components/praviders/Praviders'
import SelectExam from "./components/selectExam/SelectExam";
import Mesasure from "./components/measure/Mesasure";
import NorMalMeasurement from "./components/measure/NorMalMeasurement";
import MaxMinReturn from './utils/maxminreturn/MaxMinReturn'
import EditPetInfo from './components/editPetInfo/EditPetInfo'
import SignIn from './components/signIn/SignIn'
import WorkPlace from './components/workPlace/WorkPlace'
class App extends Component {
  render () {
    return (
      <HashRouter>
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/page1" component={Choose} />
          <Route exact path="/ezyVetLogin" component={EzyVetLogin} />
          <Route exact path="/EzyVetSelectTime" component={EzyVetSelectTime} />
          <Route exact path="/EzyVetSelectExam" component={EzyVetSelectExam} />
          <Route exact path="/page2" component={APIkey} />
          <Route exact path="/page3" component={VerifyOrganizationInformation} />
          <Route exact path="/page4" component={SelectMella} />

          {/* <Route exact path="/page5" component={Praviders} /> */}
          <Route exact path="/page5" component={SelectExam} />
          <Route exact path="/page7" component={MaxMinReturn} />

          <Route exact path="/page8" component={Mesasure} />
          <Route exact path="/page9" component={EditPetInfo} />
          <Route exact path="/page10" component={NorMalMeasurement} />
          <Route exact path="/page11" component={SignIn} />
          <Route exact path="/page12" component={WorkPlace} />
        </Switch>
      </HashRouter>
    )
  }
}
export default App
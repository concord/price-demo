import React, { PropTypes } from 'react';
import TaskList from './TaskList.jsx';
import { AppCanvas, RaisedButton, Styles } from 'material-ui';
import CandleStickDashboardChart from './CandleStickDashboardChart.jsx'
const ThemeManager = new Styles.ThemeManager();
import DashboardStore from '../stores/DashboardStore';
import DashboardActionCreators from '../actions/DashboardActionCreators';

export default React.createClass({
  onChange_() {
    this.setState(DashboardStore.getAll());
  },
  getInitialState() {
    DashboardStore.attachNotificationCallback();
    return DashboardStore.getAll();
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },

  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  componentDidMount() {
    DashboardStore.addChangeListener(this.onChange_);
  },

  componentWillUnmount() {
    DashboardStore.removeChangeListener(this.onChange_);
  },

  render() {
    if (!this.state.ready) {
      return (<div><h1>Downloading data </h1></div>)
    }
    // console .log(this.state.dashboard.length);
    return (
      <CandleStickDashboardChart chartData={this.state.dashboard}/>
    );
  }
});

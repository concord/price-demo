import React, { PropTypes } from 'react';
import TaskList from './TaskList.jsx';
import { AppCanvas, RaisedButton, Styles, AppBar} from 'material-ui';
import CandleStickDashboardChart from './CandleStickDashboardChart.jsx';
import BitcoinMovingAverages from './BitcoinMovingAverages.jsx';
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
      return (
          <div>
          <AppBar title="Concord bitcoin demo" />
          <BitcoinMovingAverages
            matchAvg={this.state.matchOrderMovingAvg}
            matchAvgPrev={this.state.matchOrderMovingAvgPrev}
            matchPrice={this.state.matchOrderPrice}
            matchPricePrev={this.state.matchOrderPricePrev}
          />
          <CandleStickDashboardChart chartData={this.state.dashboard}/>
          </div>
    );
  }
});

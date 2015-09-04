import React, { PropTypes } from 'react';
import TaskList from './TaskList.jsx';
import { AppCanvas, RaisedButton, Styles } from 'material-ui';
import VolumeChart from './VolumeChart.jsx'
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
    console.log("hello", this.state.dashboard);
    console.log("hello", this.state.ready);
    if (!this.state.ready) {
      return (<div><h1>Downloading data </h1></div>)
    }
    return (
      <VolumeChart data={this.state.dashboard}/>
      // <div className="example-page">

      //   <h1>Learning Flux</h1>
      //   <p>
      //     Below is a list of tasks you can implement to better grasp the patterns behind Flux.<br />
      //     Most features are left unimplemented with clues to guide you on the learning process.
      //   </p>

      //   <TaskList tasks={tasks} />

      //   <RaisedButton label="Add Task" primary={true} onClick={onAddTask} />
      //   <RaisedButton label="Clear List" secondary={true} onClick={onClear} />
      // </div>
      );
  }
});

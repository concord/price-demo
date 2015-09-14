import React, { PropTypes } from 'react';
import { Styles, LinearProgress } from 'material-ui';
import Chart from './Chart.jsx';

const ThemeManager = new Styles.ThemeManager();
export default React.createClass({
  propTypes: {
    chartData: PropTypes.array.isRequired
  },
  childContextTypes: {
    muiTheme: React.PropTypes.object
  },
  getChildContext() {
    return {
      muiTheme: ThemeManager.getCurrentTheme()
    };
  },
  render() {
    let chartData = this.props.chartData;
    if (!chartData || chartData.length <= 0) {
        return (
            <div>
            <p style={{'padding-left':'30px'}}>Loading Chart</p>
            <LinearProgress mode="indeterminate" size={30} />
            </div>
        );
    }

    let columns = [
      {
        type: 'datetime',
        label: 'date'
      },
      {
        type: 'number',
        label: 'price'
      }
    ];
    let options = {
      hAxis: {
        title: 'Time of bitcoin order'
      },
      vAxis: {
        title: 'Price of bitcoin'
      },
      backgroundColor: '#f1f8e9',
    };
    return (
      <div className="Examples">
      <Chart chartType={'LineChart'}
      options={options}
      width={'100%'}
      height={'640px'}
      rows={chartData}
      columns={columns} />
      </div>
      );

  }
});

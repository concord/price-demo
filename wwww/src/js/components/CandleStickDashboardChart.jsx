import React, { PropTypes } from 'react';
import Chart from './Chart';


console.log(Chart);

export default React.createClass({
  propTypes: {
    chartData: PropTypes.array.isRequired
  },
  render() {
    let chartData = this.props.chartData;

    let columns = [
      {
        type: 'date',
        label: 'Date'
      },
      {
        type: 'number',
        label: 'Low'
      },
      {
        type: 'number',
        label: 'Open'
      },
      {
        type: 'number',
        label: 'Close'
      },
      {
        type: 'number',
        label: 'High'
      }
    ];
    return (
      <div className="Examples">
      <h3>Bitcoin price</h3>
        <Chart chartType={'CandlestickChart'}
        width={'100%'}
        height={'640px'}
        rows={chartData}
        columns={columns}
        graph_id={"candlestickid"} />
      </div>
      );

  }
});

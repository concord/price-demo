import React, { PropTypes } from 'react';
import Chart from './Chart.jsx';


console.log(Chart);

export default React.createClass({
  propTypes: {
    chartData: PropTypes.array.isRequired
  },
  render() {
    let chartData = this.props.chartData;
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
      <h3>Bitcoin price</h3>
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

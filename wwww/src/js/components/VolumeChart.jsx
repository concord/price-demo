import React, {PropTypes} from 'react';

// Need to export jquery as
// window.$ for ReStock
import jquery from 'jquery'
window.$ = jquery
import ReStock from 'react-stockcharts'
import d3 from 'd3'

const ChartCanvas = ReStock.ChartCanvas
const XAxis = ReStock.XAxis
const YAxis = ReStock.YAxis
const CandlestickSeries = ReStock.CandlestickSeries
const DataTransform = ReStock.DataTransform
const Chart = ReStock.Chart
const DataSeries = ReStock.DataSeries
const ChartWidthMixin = ReStock.helper.ChartWidthMixin
const HistogramSeries = ReStock.HistogramSeries
console.log(ReStock)

export default React.createClass({
  mixins: [
    ChartWidthMixin
  ],
  getInitialState() {
    return {
      width: 960
    };
  },
  componentDidMount() {},
  propTypes: {
    data: PropTypes.array.isRequired
  },

  render() {
    if (!this.state || !this.state.width) {
      return (<div><h1>VolumeChart:Invalid arguments</h1></div>);
    }
    return (
      <ChartCanvas
      width={ this.state.width }
      height={ 400 }
      margin={{
        left: 50,
        right: 50,
        top: 10,
        bottom: 30
      }}
      data={ this.props.data }
      interval="D"
      initialDisplay={ 100 }>
      <DataTransform transformType="stockscale">
        <Chart id={ 1 }>
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis axisAt="right" orient="right" ticks={ 5 } />
          <DataSeries yAccessor={ CandlestickSeries.yAccessor }>
            <CandlestickSeries />
          </DataSeries>
        </Chart>
        <Chart id={ 2 }>
          <YAxis axisAt="left" orient="left" ticks={ 5 }
      tickFormat={ d3.format("s")} />
          <DataSeries yAccessor={ (d) => d.volume }>
            <HistogramSeries />
          </DataSeries>
        </Chart>
      </DataTransform>
    </ChartCanvas>);
  }
});

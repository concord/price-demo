import Dispatcher from '../Dispatcher';
import Constants from '../Constants';
import BaseStore from './BaseStore';
import assign from 'object-assign';
import d3 from 'd3';

// data storage
let dashboardData_ = {
  ready: false,
  dashboard: []
};



// Facebook style store creation.
const DashboardStore = assign({}, BaseStore, {
  // public methods used by Controller-View to operate on data
  getAll() {
    console.log("loop me!");
    if (!dashboardData_.ready) {
      console.log("requesting data");
      var parseDate = d3.time.format("%Y-%m-%d").parse;
      d3.tsv("//rrag.github.io/react-stockcharts/data/MSFT.tsv", (err, data) => {
        /* change MSFT.tsv to MSFT_full.tsv above to see how this works with lots of data points */
        data.forEach((d, i) => {
          d.date = new Date(parseDate(d.date).getTime());
          d.open = +d.open;
          d.high = +d.high;
          d.low = +d.low;
          d.close = +d.close;
          d.volume = +d.volume;
        //console.log(d);
        });
        if (!err) {
          dashboardData_.dashboard = data;
          dashboardData_.ready = data.length > 0;
          console.log(dashboardData_);
          //debugger;
          DashboardStore.emitChange();
        } else {
          console.log("error downloading data");
        }
      });
    }
    return dashboardData_;
  },

  // register store with dispatcher, allowing actions to flow through
  dispatcherIndex: Dispatcher.register(function(payload) {
    let action = payload.action;

    switch (action.type) {
      case Constants.ActionTypes.REGISTER_GRAPH_TOPIC:
        let text = action.text.trim();
        // TODO(agallego): send rpc to websocket for new topic
        if (text !== '') {
          // addItem(text);
          // DashboardStore.emitChange();
        }
        break;
    }
  })
});

export default DashboardStore;

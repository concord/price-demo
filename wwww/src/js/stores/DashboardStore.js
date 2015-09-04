import Dispatcher from '../Dispatcher';
import Constants from '../Constants';
import BaseStore from './BaseStore';
import assign from 'object-assign';
import d3 from 'd3';
import corejs from 'core-js';

class DashboardWebSocket {
  constructor(notification_cb = null) {
    this.notificationCallBack = notification_cb;
    this.ready = false;
    this.graphs = {
      default: []
    };
    this.socket = new WebSocket("ws://localhost:9000/dashboard");
    let self = this;
    this.socket.onmessage = (event) => {
      this.onmessage_(self, event);
    };
    this.socket.onopen = this.onopen_;
    this.socket.onclose = this.onclose_;
  }
  isReady() {
    return this.ready;
  }
  allGraphs() {
    return this.graphs;
  }
  graph(topic) {
    let ret = this.graphs[topic] = this.graphs[topic] || [];
    return ret;
  }
  onmessage_(self, event) {
    self.ready = true;
    let msg = JSON.parse(event.data);
    if (msg && msg['graphs']) {
      msg['graphs'].map((graphPoint) => {
        let k = graphPoint['topic'];
        graphPoint.date = new Date(graphPoint.date);
        self.graphs[k] = self.graphs[k] || [];
        self.graphs[k].push(graphPoint);
      });
      Object.entries(self.graphs).map(([k, v]) => {
        if (v.length > 1000) {
          v = v.slice(v.length - 1000, v.length);
        }
      });
      if (self.notificationCallBack) {
        self.notificationCallBack();
      }
    }
  }
  onopen_(event) {
    this.send(JSON.stringify({
      action: 'register',
      topic: 'btcusd'
    }));
    console.log("registered for topic: btcusd");
  }
  onclose_(event) {
    console.info("Closing websocket library", event);
  }
}

let dashboardData = new DashboardWebSocket(() => {
  console.log("Not Wired up yet");
});

const DashboardStore = assign({}, BaseStore, {
  // public methods used by Controller-View to operate on data
  attachNotificationCallback() {
    dashboardData.notificationCallBack = function() {
      DashboardStore.emitChange();
    };
    // var parseDate = d3.time.format("%Y-%m-%d").parse;
    // d3.tsv("//rrag.github.io/react-stockcharts/data/MSFT.tsv", (err, data) => {
    //   /* change MSFT.tsv to MSFT_full.tsv above to see how this works with lots of data points */
    //   data.forEach((d, i) => {
    //     d.date = new Date(parseDate(d.date).getTime());
    //     d.open = +d.open;
    //     d.high = +d.high;
    //     d.low = +d.low;
    //     d.close = +d.close;
    //     d.volume = +d.volume;
    //   // console.log(d);
    //   });
    //   console.log("Should look like: ", data);
    // });

  },
  getAll() {
    console.log("loop me!", dashboardData);
    return {
      ready: dashboardData.isReady(),
      dashboard: dashboardData.graph("default")
    };
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

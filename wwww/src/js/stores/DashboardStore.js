import Dispatcher from '../Dispatcher';
import Constants from '../constants/ActionConstants';
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
    this.matchOrderMovingAvg = 0;
    this.matchOrderMovingAvgPrev = 0;
    this.matchOrderPrice = 0;
    this.matchOrderPricePrev = 0;
    this.socket = new WebSocket("ws://localhost:9200/dashboard");
    this.socket.onerror = () => {
      console.log("WebSocket can't be created. Socket error.");
    };
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
  // Object {topic: "match-avg", avg: 229.06777777777774, time: 1442501108000}
  // Object {topic: "match-avg", avg: 229.07, time: 1442501109000}
  onmessage_(self, event) {
    self.ready = true;
    let msg = JSON.parse(event.data);
    if (msg && msg['topic']) {
      msg.time = new Date(msg.time);
      if(msg.topic === "latest-match-price") {
        let g = self.graphs["default"] = self.graphs["default"] || [];
        g.push([msg.time, msg.price]);

        self.matchOrderPricePrev = self.matchOrderPrice;
        self.matchOrderPrice = msg.price;

      }else if(msg.topic === "match-avg"){
        self.matchOrderMovingAvgPrev = self.matchOrderMovingAvg;
        self.matchOrderMovingAvg = msg.avg;
      }
      Object.entries(self.graphs).map(([k, v]) => {
        if (v.length > 100) {
          self.graphs[k] = v.slice(v.length - 100);
        }
      });
      if (self.notificationCallBack) {
        self.notificationCallBack();
      }
    }
    console.log(msg);
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
  },
  getAll() {
    return {
      ready: dashboardData.isReady(),
      dashboard: dashboardData.graph("default"),
      matchOrderMovingAvg: dashboardData.matchOrderMovingAvg,
      matchOrderMovingAvgPrev: dashboardData.matchOrderMovingAvgPrev,
      matchOrderPrice: dashboardData.matchOrderPrice,
      matchOrderPricePrev: dashboardData.matchOrderPricePrev
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

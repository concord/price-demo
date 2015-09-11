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
    this.socket = new WebSocket("ws://localhost:9000/dashboard");
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
  onmessage_(self, event) {
    self.ready = true;
    let msg = JSON.parse(event.data);
    if (msg && msg['graphs']) {
      msg['graphs'].map((pt) => {
        let k = pt['topic'];
        pt.date = new Date(pt.date);
        let g = self.graphs[k] = self.graphs[k] || [];
        g.push([pt.date, pt.close]);
      });
      Object.entries(self.graphs).map(([k, v]) => {
        if (v.length > 100) {
          self.graphs[k] = v.slice(v.length - 100);
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
  },
  getAll() {
    return {
      ready: dashboardData.isReady(),
      dashboard: dashboardData.graph("default"),
      matchOrderMovingAvg: dashboardData.matchOrderMovingAvg || Math.random(),
      matchOrderMovingAvgPrev: dashboardData.matchOrderMovingAvgPrev || Math.random()
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

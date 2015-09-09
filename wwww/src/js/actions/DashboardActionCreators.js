import Dispatcher from '../Dispatcher';
import Constants from '../constants/ActionConstants';

export default {
  registerGraphTopic(text) {
    Dispatcher.handleViewAction({
      type: Constants.ActionTypes.REGISTER_GRAPH_TOPIC,
      topic: text
    });
  }
};

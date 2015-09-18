import json
import sys
import time
import concord
from concord.computation import (Computation, Metadata, serve_computation,
                                 StreamGrouping)
from models.CoinbaseOrder import CoinbaseOrder
from utils.time_utils import (time_millis, bottom_of_current_second,
                              nseconds_from_now_in_millis)
from utils.kafka_utils import local_kafka_producer

class LatestMatchPrice(Computation):
    def __init__(self):
        self.producer = local_kafka_producer('latest-match-price')

    def init(self, ctx):
        self.concord_logger.info("Latest price init")

    def process_record(self, ctx, record):
        order = CoinbaseOrder(record.data)
        if order.type == 'match':
            self.concord_logger.info("Emitting latest price: %s",
                                     str(order.price))
            d = {'time': time_millis(), 'price': order.price}
            self.producer.produce(json.dumps(d))

    def metadata(self):
        return Metadata(name='latest-price',
                        istreams=[['btcusd', StreamGrouping.GROUP_BY]])

serve_computation(LatestMatchPrice())

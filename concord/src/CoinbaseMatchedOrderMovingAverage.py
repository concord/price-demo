import json
import sys
import time
import concord
import cachetools

from kafka import SimpleProducer, KafkaClient

#TODO(agallego), import subtypes->subtypes
from concord.computation import (Computation, Metadata, serve_computation)
from models.Avg import Avg
from models.CoinbaseOrder import CoinbaseOrder
from utils.time_utils import (time_millis, bottom_of_current_second,
                              nseconds_from_now_in_millis)

# TODO(agallego): At the moment is NOT a moving average, it is the real average
# the Avg.class holds an array and a counter of N to compute it
#
class CoinbaseMatchedOrderMovingAverage(Computation):
    def __init__(self):
        from cachetools import TTLCache
        self.cache = TTLCache(10, 100, missing=lambda x: Avg());
        self.kafka = KafkaClient('localhost:9092')
        self.producer = SimpleProducer(self.kafka, async=True)

    def init(self, ctx):
        self.concord_logger.info("Matched order moving avg init")

    def process_record(self, ctx, record):
        order = CoinbaseOrder(record.data)
        if order.type == 'match':
            self.concord_logger.info("Found matched order at price: %s",
                                     str(order.price))
            sec = bottom_of_current_second()
            avg = self.cache[sec]
            avg.append(order.price)
            ctx.set_timer(str(sec), nseconds_from_now_in_millis(1))

    def process_timer(self, ctx, key, time):
        self.concord_logger.info("Emmiting avg for second: %s", key)
        avg_time = int(key)
        avg = self.cache[avg_time]
        if avg is not None:
            d = {
                'time': avg_time,
                'avg': avg.avg()
            }
            self.producer.send_messages(b'match-avg', json.dumps(d))
            self.concord_logger.info("Saving to kafka for time: %s ", key)

    def metadata(self):
        return Metadata(name='match-orders-sec-avg', istreams=['btcusd'])

serve_computation(CoinbaseMatchedOrderMovingAverage())

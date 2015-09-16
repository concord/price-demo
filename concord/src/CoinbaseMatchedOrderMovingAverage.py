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
        for h in self.concord_logger.handlers:
            h.flush()

    def process_record(self, ctx, record):
        #try:
        order = CoinbaseOrder(record.data)
        self.concord_logger.info("Type: %s", order.type)
        if order.type == 'open':
            sec = bottom_of_current_second()
            avg = self.cache[sec]
            avg.append(order.price)
            ctx.set_timer(str(sec), nseconds_from_now_in_millis(1))

        # except Exception as e:
        #     self.concord_logger.exception(e)
        #     self.concord_logger.error(
        #         "Could not process message %s ", record.data)

    def process_timer(self, ctx, key, time):
        self.concord_logger.info("hello motto, timer %s", key)
        avg_time = int(key)
        avg = self.cache[avg_time]
        if avg is not None:
            d = {
                'time': avg_time,
                'avg': avg.avg()
            }
            self.producer.send_messages(b'match-avg', json.dumps(d))
            self.concord_logger.error("Could not process timer %s ", key)

    def metadata(self):
        return Metadata(name='match-orders-sec-avg', istreams=['btcusd'])

serve_computation(CoinbaseMatchedOrderMovingAverage())

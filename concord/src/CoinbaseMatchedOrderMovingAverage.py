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

import logging
logging.basicConfig()
#
# TODO(agallego): At the moment is NOT a moving average, it is the real average
# the Avg.class holds an array and a counter of N to compute it
#
class CoinbaseMatchedOrderMovingAverage(Computation):
    def __init__(self):
        from cachetools import TTLCache
        self.cache = TTLCache(10, 100, missing=lambda x: Avg());
        self.kafka = KafkaClient('localhost:9092')
        self.producer = SimpleProducer(self.kafka)

    def init(self, ctx):
        self.concord_logger.info("Matched order moving avg init")
        ctx.set_timer('flush', time_millis() + 1000) # start in 1 sec

    # Ok here is the algo
    # 1. Check of the Avg exists, if not try fetching it from the cache
    # 2. if it doesn't exist, create an empty one
    # 3. Add and aggregate and set the timer to emmit in one second from now w/
    #    the time to fetch it from the queue as the key... and emit it
    #    downstream into the queue
    def process_record(self, ctx, record):
        try:
            # serialize
            order = CoinbaseOrder(record.data)
            if order.type == 'match':
                sec = bottom_of_current_second()
                avg = self.cache[sec]
                avg.append(order.price)
                ctx.set_timer(str(sec), nseconds_from_now_in_millis(1))
            # set the timer
        except:
            self.concord_logger.error(
                "Could not process message %s ", record.data)

    def process_timer(self, ctx, key, time):
        avg_time = int(key)
        avg = self.cache[avg_time]
        if avg is not None:
            d = {
                time: avg_time,
                avg: avg.avg()
            }
            producer.send_messages(b'match-avg', json.dumps(d))

    def metadata(self):
        return Metadata(name='match-orders-sec-avg', istreams=['btcusd'])

serve_computation(CoinbaseMatchedOrderMovingAverage())

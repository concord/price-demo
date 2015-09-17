import json
import sys
import time
import concord
from kafka import SimpleProducer, KafkaClient
from collections import deque
from concord.computation import (Computation, Metadata, serve_computation)
from models.CoinbaseOrder import CoinbaseOrder
from utils.time_utils import (time_millis, bottom_of_current_second,
                              nseconds_from_now_in_millis)

# stores 1k numbers as the avg. simpler, but def not correct
class MovingAvg(deque):
    def __init__(self, size=1000):
        super(MovingAvg, self).__init__(maxlen=size)

    @property
    def average(self):
        if len(self) <= 0: return 0
        return sum(self)/len(self)


# TODO(agallego): use pandas / numpy
class CoinbaseMatchedOrderMovingAverage(Computation):
    def __init__(self):
        self.moving_average = MovingAvg()
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
            self.moving_average.append(order.price)
            ctx.set_timer(str(sec), nseconds_from_now_in_millis(1))

    def process_timer(self, ctx, key, time):
        avg_time = int(key)
        d = {
            'time': avg_time * 1000,
            'avg': self.moving_average.average
        }
        self.producer.send_messages(b'match-avg', json.dumps(d))
        self.concord_logger.info("Saving to kafka for time: %s, avg price: %s",
                                 key, str(self.moving_average.average))

    def metadata(self):
        return Metadata(name='match-orders-sec-avg', istreams=['btcusd'])

serve_computation(CoinbaseMatchedOrderMovingAverage())

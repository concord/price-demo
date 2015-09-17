import json
import sys
import time
import concord
from kafka import SimpleProducer, KafkaClient
from concord.computation import (Computation, Metadata, serve_computation)
from models.CoinbaseOrder import CoinbaseOrder
from utils.time_utils import (time_millis, bottom_of_current_second,
                              nseconds_from_now_in_millis)

class LatestMatchPrice(Computation):
    def __init__(self):
        self.price = 0.0
        self.kafka = KafkaClient('localhost:9092')
        self.producer = SimpleProducer(self.kafka, async=True)

    def init(self, ctx):
        self.concord_logger.info("Latest price init")
        sec = nseconds_from_now_in_millis(1)
        ctx.set_timer(str(sec), sec)

    def process_record(self, ctx, record):
        order = CoinbaseOrder(record.data)
        if order.type == 'match':
            self.price = order.price


    def process_timer(self, ctx, key, time):
        avg_time = int(key) # already in millisecs
        d = {'time': avg_time, 'price': self.price}
        self.producer.send_messages(b'latest-match-price', json.dumps(d))
        sec = nseconds_from_now_in_millis(1)
        ctx.set_timer(str(sec), sec)

    def metadata(self):
        return Metadata(name='latest-price', istreams=['btcusd'])

serve_computation(LatestMatchPrice())

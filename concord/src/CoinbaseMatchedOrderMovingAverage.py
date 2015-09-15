import json
import sys
import time
from Queue import Queue
import concord
from concord.computation import (
    Computation,
    Metadata,
    serve_computation
)

def time_millis():
    return int(round(time.time() * 1000))

class CoinbaseMatchedOrderMovingAverage(Computation):
    def __init__(self):
        self.queue = Queue()
    def init(self, ctx):
        self.concord_logger.info("Matched order moving avg init")
        ctx.set_timer('flush', time_millis() + 1000) # start in 1 sec


    def process_record(self, ctx, record):


    def process_timer(self, ctx, key, time):
        while not self.queue.empty():
            ctx.produce_record('btcusd', 'empty', self.queue.get())
        ctx.set_timer(key, time_millis() + 1000) # every sec
    def metadata(self):
        return Metadata(name='coinbase-match-orders', istreams=['btcusd'])

serve_computation(CoinbaseMatchedOrderMovingAverage())

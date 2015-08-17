import json
from websocket import create_connection
import sys
import time
import logging
logging.basicConfig()
log = logging.getLogger('CoinbaseSource')
log.setLevel(logging.DEBUG)

import concord
from concord.computation import (
    Computation,
    Metadata,
    serve_computation
)

COINBASE_FEED_URL = "wss://ws-feed.exchange.coinbase.com"

def time_millis():
    return int(round(time.time() * 1000))

class CoinbaseSource(Computation):
    def init(self, ctx):
        log.info("Coinbase initialized")
        self.ws = create_connection(COINBASE_FEED_URL)
        log.info("web socket connection to exchange created")
        ctx.set_timer('loop', time_millis() + 1000) # start in 1 sec
    def process_timer(self, ctx, key, time):
        self.ws.send(json.dumps({
            "type": "subscribe",
            "product_id": "BTC-USD"
        }))
        record = self.ws.recv()
        ctx.produce_record('btcusd', 'empty', record)
        ctx.set_timer(key, time_millis() + 1000) # every sec
    def metadata(self):
        return Metadata(name='coinbase-indx', istreams=[], ostreams=['btcusd'])

serve_computation(CoinbaseSource())

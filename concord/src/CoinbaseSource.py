import json
import sys
import time
import logging
from Queue import Queue
from twisted.internet import reactor
from threading import Thread
from autobahn.twisted.websocket import (
    WebSocketClientFactory,
    WebSocketClientProtocol,
    connectWS
)
import concord
from concord.computation import (
    Computation,
    Metadata,
    serve_computation
)
logging.basicConfig()
log = logging.getLogger('CoinbaseSource')
log.setLevel(logging.DEBUG)

def time_millis():
    return int(round(time.time() * 1000))

class ExchangeProtocol(WebSocketClientProtocol):
    def onOpen(self):
        log.info("websocket opened")
        self.sendMessage(json.dumps({
            "type": "subscribe",
            "product_id": "BTC-USD"
        }))
    def onMessage(self, payload, *args, **kwargs):
        self.factory.queue.put(payload)
    def onClose(self, wasClean, code, reason):
        log.info("websocket closed because", reason)
        self.factory.close_cb()

class CoinbaseSource(Computation):
    def __init__(self):
        self.queue = Queue()
    def init(self, ctx):
        ctx.set_timer('loop', time_millis() + 1000) # start in 1 sec
        log.info("Coinbase initialized")
    def process_timer(self, ctx, key, time):
        while not self.queue.empty():
            ctx.produce_record('btcusd', 'empty', self.queue.get())
        ctx.set_timer(key, time_millis() + 1000) # every sec
    def metadata(self):
        return Metadata(name='coinbase-indx', istreams=[], ostreams=['btcusd'])

def gen_coinbase_source():
    ret = CoinbaseSource()
    factory = WebSocketClientFactory("wss://ws-feed.exchange.coinbase.com")
    factory.queue = ret.queue
    factory.close_cb = reactor.stop
    factory.protocol = ExchangeProtocol
    connectWS(factory)
    Thread(target=reactor.run, args=(False,)).start()
    return ret

serve_computation(gen_coinbase_source())

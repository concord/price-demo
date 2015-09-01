import json
import sys
import unicodedata
import logging
import concord
from concord.computation import (
    Computation,
    Metadata,
    serve_computation
)
import dateutil
import cachetools

logging.basicConfig()
log = logging.getLogger('CoinbasePricePrinter')
log.setLevel(logging.DEBUG)

def time_millis(): return int(round(time.time() * 1000))
def next_second(sec=1): return time_millis() + (sec * 1000)

class CoinbaseOrder:
    def __init__(self, json_data):
        r = json.loads(json_data)
        for key in r: setattr(self, key, r[key])
        from dateutil.parser import parse
        self.time = parse(self.time)
        self.sequence = int(self.sequence)
        self.price = float(self.price)

    def valid(self):
        return self.sequence > 0


    @staticmethod
    def to_json(coinbase_order):
        return json.dumps(coinbase_order,
                          default=lambda o: o.__dict__,
                          sort_keys=True)

    @staticmethod
    def from_json(byte_array):
        return CoinbaseOrder(json.loads(byte_array))

    @staticmethod
    def combine(lhs_coinbase, rhs_coinbase):
        if not is_combinable(lhs_coinbase, rhs_coinbase):
            raise Exception("Cannot combine orders")
        ret = lhs_coinbase
        ret.price += rhs_coinbase.price
        return ret

    @staticmethod
    def is_combinable(lhs_coinbase, rhs_coinbase):
        try:
            return (lhs_coinbase.type == rhs_coinbase.type &&
                    lhs_coinbase.side == rhs_coinbase.side)
        except:
            return false

class CoinbasePricePrinter(Computation):
    def __init__(self):
        from cachetools import TTLCache
        def missing_order(order_type):
            return CoinbaseOrder(
                {'time': '1970-01-01T00:00:0Z',
                 'sequence': 0,
                 'price': 0,
                 'type': order_type})

        self.order_cache = TTLCache(10, 300, missing=missing_order)
        self.volume_cache = TTLCache(10, 300, missing=lambda x: 0)


    def update_volume(self, coinbase_order, context):
        current = self.volume_cache[coinbase_order.time]
        self.volume_cache[c.time] = (current +
                                     (coinbase_order.price * coinbase.volume))
        context.set_state(CoinbasePricePrinter.volume_key(coinbase_order.time),
                          CoinbaseOrder.to_json(self.volume_cache[c.time]))


    # TODO(agallego) map(filter(test,cache)cache)
    def update_orders(self, coinbase_order, context):
        if not coinbase_order.valid(): return
        current = self.order_cache[coinbase_order.type]
        if not current.valid():
            self.order_cache[coinbase_order.type] = coinbase_order
        else if CoinbaseOrder.is_combinable(coinbase_order, current):
            self.order_cache[coinbase_order.type] = CoinbaseOrder.combie(
                current, coinbase_order)
        else:
            raise Exception("Couldn't combine with any orders", coinbase_order)

        context.set_state(CoinbasePricePrinter.durable_key(coinbase_order),
                          CoinbasePricePrinter.to_json(
                              self.order_cache[coinbase_order.type]))

    def init(self, ctx):
        log.info("Price Printer initialized")
        ctx.set_timer("loop", next_second())

    def process_record(self, ctx, record):
        try:
            c = CoinbaseOrder(record.data)
            self.update_volume(c)
            self.update_orders(c)
        except as e:
            log.exception(e)

    def process_timer(self, ctx, key, time):
        ctx.produce_record('btcusd-volume', self.volume_key(time),
                           self.cache(self.volume_key(time)))
        ctx.produce_record('btcusd-buy', self.buy_key(time),
                           self.cache(self.buy_key(time)))
        ctx.produce_record('btcusd-sell', self.sell_key(time),
                           self.cache(self.sell_key(time)))
        ctx.set_timer(key, next_second())

    def metadata(self):
        return Metadata(name='coinbase-price-printer',
                        istreams=['btcusd'], ostreams=[])

    @staticmethod
    def durable_key(coinbase_order):
        key_map = {
            'sell' = CoinbasePricePrinter.sell_key(coinbase_order.time),
            'buy' = CoinbasePricePrinter.buy_key(coinbase_order.time),
        }
        return key_map[coinbase_order.type]

    @staticmethod
    def to_bottom_of_second(time_stamp_millis):
        return time_stamp_millis - (time_stamp_millis % 1000)

    @staticmethod
    def volume_key(time_stamp):
        return 'volume-' + str(
            CoinbasePricePrinter.to_bottom_of_second(time_stamp))

    @staticmethod
    def sell_key(time_stamp):
        return 'sell-' + str(
            CoinbasePricePrinter.to_bottom_of_second(time_stamp))

    @staticmethod
    def buy_key( time_stamp):
        return 'buy-' + str(
            CoinbasePricePrinter.to_bottom_of_second(time_stamp))

serve_computation(CoinbasePricePrinter())

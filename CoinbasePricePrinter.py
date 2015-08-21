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

logging.basicConfig()
log = logging.getLogger('CoinbasePricePrinter')
log.setLevel(logging.DEBUG)


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


    # static methods
    #
    def to_bytes(coinbase_order):
        pickle.dumps(coinbase_order);

    def from_bytes(byte_array):
        return pickle.loads(byte_array)

    def combine(lhs_coinbase, rhs_coinbase):
        if not is_combinable(lhs_coinbase, rhs_coinbase):
            raise Exception("Cannot combine orders")
        ret = lhs_coinbase
        ret.price += rhs_coinbase.price
        return ret

    def is_combinable(lhs_coinbase, rhs_coinbase):
        try:
            return (lhs_coinbase.type == rhs_coinbase.type &&
                    lhs_coinbase.side == rhs_coinbase.side)
        except:
            return false

class CoinbasePricePrinter(Computation):
    def init(self, ctx):
        log.info("Price Printer initialized")
    def process_record(self, ctx, record):
        c = CoinbaseOrder(record.data)
        c2 = ctx->get_state(c.type)

        # load previous record, combine and then
        # store again
    def process_timer(self, ctx, key, time):
        log.info("foo.bar")

    def metadata(self):
        return Metadata(name='coinbase-price-printer',
                        istreams=['btcusd'], ostreams=[])

serve_computation(CoinbasePricePrinter())

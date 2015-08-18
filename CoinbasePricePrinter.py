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

class CoinbasePricePrinter(Computation):
    def init(self, ctx):
        log.info("Price Printer initialized")
    def process_record(self, ctx, record):
        r = json.loads(record.data)
        price = r.get('price', 'no-price-avail')
        log.info('Price: %s', price)
    def metadata(self):
        return Metadata(name='coinbase-price-printer',
                        istreams=['btcusd'], ostreams=[])

serve_computation(CoinbasePricePrinter())

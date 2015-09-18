# coding: utf-8
from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
from __future__ import unicode_literals

import time
import json
import dateutil

class CoinbaseOrder:
    def __init__(self, json_data):
        r = json.loads(json_data)
        for key in r: setattr(self, key, r[key])
        from dateutil.parser import parse
        self.time = parse(self.time)
        self.sequence = int(self.sequence)
        if self.type in ['match', 'open', 'close']:
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
            return (lhs_coinbase.type == rhs_coinbase.type and
                    lhs_coinbase.side == rhs_coinbase.side)
        except:
            return false

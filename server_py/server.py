import sys
from twisted.internet import reactor
from twisted.python import log
from twisted.web.server import Site
from twisted.web.static import File
from autobahn.twisted.websocket import (WebSocketServerFactory,
                                        WebSocketServerProtocol)
from autobahn.twisted.resource import WebSocketResource
from kafka import KafkaConsumer
import threading
import logging
import logging.handlers
import json
logging_format_string='%(levelname)s:%(asctime)s %(filename)s:%(lineno)d] %(message)s'
logging.basicConfig(format=logging_format_string)
log = logging.getLogger('concord.WebsocketServer')
log.setLevel(logging.DEBUG)

# more advanced consumer -- multiple topics w/ auto commit offset
# management
def new_kafka_consumer():
    return KafkaConsumer('latest-match-price', 'match-avg',
                         bootstrap_servers=['localhost:9092'],
                         group_id='website_consumer_group',
                         auto_commit_enable=False,
                         auto_commit_interval_ms=30 * 1000,
                         # change to largest,smallest for prod
                         auto_offset_reset='largest')

class KafkaWebSocketService(WebSocketServerProtocol):
    def onConnect(self, request):
        log.info("WebSocket connection request: {}".format(request))

    def onMessage(self, payload, isBinary):
        if hasattr(self, 'kafka_thread'):
            log.info("Received payload: %s", str(payload))
            return
        kafka_consumer = new_kafka_consumer()
        def drain_kafka_queue():
            try:
                for msg in kafka_consumer:
                    d = json.loads(msg.value)
                    d['topic'] = msg.topic
                    self.sendMessage(json.dumps(d))
            except Exception as e:
                log.error("Error sending message: %s", e)
            finally:
                kafka_consumer.stop()
                log.info("exiting thread")

        self.kafka_thread = threading.Thread(target=drain_kafka_queue)
        self.kafka_thread.start()

if __name__ == '__main__':
    port = 9200
    log.info("Starting websocket factory")
    factory = WebSocketServerFactory(u"ws://127.0.0.1:" + str(port))
    factory.protocol = KafkaWebSocketService
    resource = WebSocketResource(factory)
    # we server static files under "/" ..
    root = File(".")

    # and our WebSocket server under "/dashboard"
    root.putChild(u"dashboard", resource)

    # both under one Twisted Web Site
    site = Site(root)

    log.info("Starting service")
    reactor.listenTCP(port, site)
    reactor.run()

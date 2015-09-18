from pykafka import (KafkaClient)
import collections
import threading
import time

def kafka_producer(kafka_client, topic):
    return kafka_client.topics[topic].get_producer()


def local_kafka_client():
    return KafkaClient(hosts='localhost:9092')

def local_kafka_producer(topic):
    cli = local_kafka_client()
    return kafka_producer(cli, topic)


# TODO(agallego): stop threads?
class MultiTopicConsumer:
    def __init__(self, *topics):
        self.cli = local_kafka_client()
        self.kafka_topics = []
        for topic_name in topics:
            topic = {
                'topic_name': topic_name,
                'msg_queue': collections.deque(),
                'kafka_consumer': self.cli.topics[topic_name].get_simple_consumer()
            }
            self.kafka_topics.append(topic)
            def fetcher():
                while True:
                    c = topic['kafka_consumer']
                    q = topic['msg_queue']
                    # this operation is blocking
                    for m in c:
                        if m is not None and len(q) < 1024: q.append(m)
                        else: time.sleep(1)
            topic['thread'] = threading.Thread(target=fetcher)
            topic['thread'].start()

    def __iter__(self):
        return self
    def next(self):
        def empty_first():
            for t in self.kafka_topics:
                if len(t['msg_queue']) > 0:
                    retval = list(t['msg_queue'])
                    t['msg_queue'].clear()
                    return retval
            return []

        ret = empty_first()
        while len(ret) <= 0:
            time.sleep(1)
            ret = empty_first()
        return ret

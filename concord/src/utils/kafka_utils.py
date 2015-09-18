from kafka import (SimpleProducer, KafkaClient, KafkaConsumer)


def sync_producer(kafka_client):
    """This is optimized for localhost:9092 usg"""
    return SimpleProducer(kafka_client, async=False,
                          req_acks=SimpleProducer.ACK_AFTER_LOCAL_WRITE,
                          batch_send_every_n=10,
                          ack_timeout=100, # ms
                          sync_fail_on_error=True)


def local_kafka_client():
    return KafkaClient('localhost:9092')

def local_kafka_producer():
    return sync_producer(local_kafka_client())


def local_kafka_consumer(*topics):
    return KafkaConsumer(topics,
                         bootstrap_servers=['localhost:9092'],
                         group_id='website_consumer_group',
                         auto_commit_enable=True,
                         auto_commit_interval_ms=30 * 1000,
                         # change to largest,smallest for prod
                         auto_offset_reset='smallest')

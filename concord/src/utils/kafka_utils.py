from pykafka import (KafkaClient)


def kafka_producer(kafka_client, topic):
    return kafka_client.topics[topic].get_producer()


def local_kafka_client():
    return KafkaClient(hosts='localhost:9092')

def local_kafka_producer(topic):
    cli = local_kafka_client()
    return kafka_producer(cli, topic)


def local_kafka_consumer(*topics):
    return KafkaConsumer(topics,
                         bootstrap_servers=['localhost:9092'],
                         group_id='website_consumer_group',
                         auto_commit_enable=True,
                         auto_commit_interval_ms=30 * 1000,
                         # change to largest,smallest for prod
                         auto_offset_reset='smallest')

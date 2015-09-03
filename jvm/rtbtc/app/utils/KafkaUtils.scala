package utils

import com.typesafe.scalalogging.LazyLogging
import kafka.api.{ FetchRequest, FetchRequestBuilder }
import kafka.javaapi.consumer.SimpleConsumer
import kafka.javaapi.message.ByteBufferMessageSet
import kafka.message.MessageAndOffset

class LocalConsumer(topic: String) extends AutoCloseable with LazyLogging {
  val kFetchSize = 1024
  val uuidStr = java.util.UUID.randomUUID.toString
  val rawConsumer = new SimpleConsumer("localhost", 9091, 100000, 64 * 1024, uuidStr);
  private[this] var lastFetchOffset = kafka.api.OffsetRequest.LatestTime
  private[this] val partition = 0

  def fetch(): List[Array[Byte]] = {
    val req = new FetchRequestBuilder()
      .clientId(uuidStr)
      .addFetch(topic, partition, lastFetchOffset, kFetchSize)
      .build();
    val fetchResponse = rawConsumer.fetch(req);
    if (fetchResponse.hasError) {
      logger.info("Error fetching from kafka")
      List()
    } else {
      import scala.collection.JavaConversions._
      asScalaIterator(fetchResponse.messageSet(topic, 0).iterator)
        .toList
        .map { msgAndOffset =>
          val payload = msgAndOffset.message.payload;
          val bytes = new Array[Byte](payload.limit());
          payload.get(bytes);
          lastFetchOffset = msgAndOffset.nextOffset
          bytes
        }
    }
  }
  override def close = {
    logger.info("Closing raw consumer to kafka")
    rawConsumer.close()
  }
}

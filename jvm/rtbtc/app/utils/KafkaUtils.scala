package utils

import kafka.api.{ FetchRequest, FetchRequestBuilder }
import kafka.javaapi.consumer.SimpleConsumer
import kafka.javaapi.message.ByteBufferMessageSet
import kafka.message.MessageAndOffset

class LocalConsumer(topic: String) extends AutoCloseable {
  val uuidStr = java.util.UUID.randomUUID.toString
  val rawConsumer = new SimpleConsumer("localhost", 9091, 100000, 64 * 1024, uuidStr);
  def fetch(): List[Array[Byte]] = {
    // val offset = kafka.api.OffsetRequest.LatestTime()
    val req = new FetchRequestBuilder()
      .clientId(uuidStr)
      .addFetch(topic, 0, 0L, 100)
      .build();
    val fetchResponse = rawConsumer.fetch(req);
    // TODO(agallego): obvi, update the offsets, etc.
    if (fetchResponse.hasError) {
      //....... do some error code handling
      List()
    } else {
      import scala.collection.JavaConversions._
      val messages = asScalaIterator(fetchResponse.messageSet(topic, 0).iterator)
        .map { msgAndOffset =>

        }

      // for (MessageAndOffset messageAndOffset : ) {
      //         long currentOffset = messageAndOffset.offset();
      //         if (currentOffset < readOffset) {
      //             System.out.println("Found an old offset: " + currentOffset + " Expecting: " + readOffset);
      //             continue;
      //         }
      //         readOffset = messageAndOffset.nextOffset();
      //         ByteBuffer payload = messageAndOffset.message().payload();

      //         byte[] bytes = new byte[payload.limit()];
      //         payload.get(bytes);
      //         System.out.println(String.valueOf(messageAndOffset.offset()) + ": " + new String(bytes, "UTF-8"));
      //         numRead++;
      // }
      List()
    }
  }
  override def close = {
    rawConsumer.close()
  }
}

object KafkaUtils {

}

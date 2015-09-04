package controllers

import com.typesafe.scalalogging.StrictLogging
import java.util.Random
import play.api._
import play.api.libs.iteratee.Concurrent
import play.api.libs.iteratee.Concurrent.Channel
import play.api.libs.iteratee.Iteratee
import play.api.libs.iteratee.Iteratee._
import play.api.libs.json.JsValue
import play.api.libs.json.Json
import play.api.mvc._
import play.api.Play.current
import utils.Events._
import scala.math

class Application extends Controller with StrictLogging {
  import play.api.libs.concurrent.Execution.Implicits.defaultContext
  import utils.JsonFormats._
  def index = Action {
    logger.info("Available cores: " + Runtime.getRuntime().availableProcessors())
    Ok(views.html.index("Concord!"))
  }
  // Concurrent.broadcast returns (Enumerator, Concurrent.Channel)
  val (clientEnumerator, dataChannel) = Concurrent.broadcast[JsValue]

  def dashboard = WebSocket.using[JsValue] { request =>
    logger.info("New websocket client request")
    val in = Iteratee.foreach[JsValue] { js =>
      logger.info(s"Javascript request: $js")
      (js \ "topic").asOpt[String] match {
        case Some("btcusd") =>
          logger.info("Producing btcusd")
          new Thread {
            while (true) {
              logger.info("Producing graph point")
              val ret = DashboardData(Some((0 to 999).map {
                x => genGraphEventPoint
              }.toList.sortWith((x: GraphEventPoint, y: GraphEventPoint) => {
                x.date < y.date
              })))
              dataChannel.push(Json.toJson(ret))
              Thread.sleep(10000)
            }
          }.start
        case Some(x) => logger.info("Skipping invalid request for topic: " + x)
        case _ =>
      }
    }
    (in, clientEnumerator)
  }

  // FIXME:(agallego) - delete
  def genGraphEventPoint: GraphEventPoint = {
    val rand = new Random()
    val d = rand.nextDouble
    GraphEventPoint(
      "default",
      "update",
      java.lang.System.currentTimeMillis - (rand.nextLong % 100000),
      rand.nextDouble * 100000, // volume
      d * 1000, // open
      (d + rand.nextDouble) * 1000, // close
      (d + rand.nextDouble + rand.nextDouble) * 1000, // high
      math.max(0.002d, d - rand.nextDouble) * 1000 // low
    )
  }

}

package controllers

import com.typesafe.scalalogging.LazyLogging
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

class Application extends Controller with LazyLogging {
  import play.api.libs.concurrent.Execution.Implicits.defaultContext
  import utils.JsonFormats._
  def index = Action {
    logger.info("Runtime procs: " + Runtime.getRuntime().availableProcessors())
    Ok(views.html.index("Concord!"))
  }

  def graph = WebSocket.using[JsValue] { request =>
    logger.info("New websocket client request")
    // Concurrent.broadcast returns (Enumerator, Concurrent.Channel)
    val (out, channel) = Concurrent.broadcast[JsValue]
    val in = Iteratee.foreach[JsValue] { js =>
      logger.info(s"Javascript request: $js")
      (js \ "topic").asOpt[String] match {
        case Some("btcusd") =>
          new Thread {
            while (true) {
              channel.push(Json.toJson(GraphEventPoint("foo", 0.0, 0.0, 0.0)))
              Thread.sleep(10000)
            }
          }.start
        case Some(x) => logger.info("Skipping invalid request for topic: " + x)
        case _ =>
      }
    }
    (in, out)
  }
}

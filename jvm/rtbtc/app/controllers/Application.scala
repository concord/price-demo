package controllers

import play.api._
import play.api.libs.iteratee.Concurrent
import play.api.libs.iteratee.Concurrent.Channel
import play.api.libs.iteratee.Iteratee
import play.api.libs.iteratee.Iteratee._
import play.api.mvc._
import akka.actor._
import play.api.Play.current
import play.api.libs.json._
import play.api.mvc.WebSocket.FrameFormatter
import play.api.libs.concurrent.Execution.Implicits.defaultContext
import scala.util.control.NonFatal

case class GraphEventRegistration(topic: String)
case class GraphEventPoint(topic: String, sell: Double, buy: Double, volume: Double)

object JsonFormats {
  implicit val registrationFormat = Json.format[GraphEventRegistration]
  implicit val registrationFrame: FrameFormatter[GraphEventRegistration] =
    FrameFormatter.stringFrame.transform(_.toString, Json.parse(_).as[GraphEventRegistration])

  implicit val eventJsonFormat = Json.format[GraphEventPoint]
  implicit val eventFrame: FrameFormatter[GraphEventPoint] =
    FrameFormatter.stringFrame.transform(_.toString, Json.parse(_).as[GraphEventPoint])
  implicit val myJsonFrame: FrameFormatter[JsValue] =
    implicitly[FrameFormatter[String]].transform(Json.stringify, { text =>
      try {
        Json.parse(text)
      } catch {
        case NonFatal(e) => Json.obj("error" -> e.getMessage)
      }
    })
}

class GraphWebSocketActor(dataChannel: Channel[JsValue]) extends Actor {
  import JsonFormats._

  def receive = {
    case e: GraphEventRegistration =>
      Logger.info(self + e.toString)
      produceMessage(e)
  }

  def produceMessage(e: GraphEventRegistration) =
    dataChannel.push(Json.toJson(GraphEventPoint(e.topic, 0.0, 0.0, 0.0)))

  override def postStop() = {
    Logger.info("closing websocket")
  }

}

class Application extends Controller {
  import JsonFormats._
  def index = Action {
    Logger.info("Runtime procs: " + Runtime.getRuntime().availableProcessors())
    Ok(views.html.index("Concord!"))
  }

  def graph = WebSocket.using[JsValue] { request =>
    Logger.info("New websocket client request")
    // Concurrent.broadcast returns (Enumerator, Concurrent.Channel)
    val (out, channel) = Concurrent.broadcast[JsValue]
    val in = Iteratee.foreach[JsValue] { js =>
      Logger.info(s"Javascript request: $js")
      (js \ "topic").asOpt[String] match {
        case Some("btcusd") =>
          new Thread {
            while (true) {
              channel.push(Json.toJson(GraphEventPoint("foo", 0.0, 0.0, 0.0)))
              Thread.sleep(10000)
            }
          }.start
        case Some(x) => Logger.info("Skipping invalid request for topic: " + x)
        case _ =>
      }
    }
    (in, out)
  }
}

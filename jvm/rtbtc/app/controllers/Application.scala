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
      println(self + e.toString)
      produceMessage(e)
  }

  def produceMessage(e: GraphEventRegistration) =
    dataChannel.push(Json.toJson(GraphEventPoint(e.topic, 0.0, 0.0, 0.0)))

  override def postStop() = {
    println("closing socket")
  }

}

class Application extends Controller {
  import JsonFormats._
  def index = Action {
    //println(Runtime.getRuntime().availableProcessors())
    Ok(views.html.index("Your new application is ready."))
  }

  def graph = WebSocket.using[JsValue] { request =>
    println("wellp")
    // Concurrent.broadcast returns (Enumerator, Concurrent.Channel)
    val (out, channel) = Concurrent.broadcast[JsValue]
    val in = Iteratee.foreach[JsValue] { msg =>
      println(msg)
      new Thread {
        while (true) {
          println("wuuuuuuuuuuut")
          channel.push(Json.toJson(GraphEventPoint("foo", 0.0, 0.0, 0.0)))
          Thread.sleep(10000)
        }
      }.start
    }

    (in, out)
  }
}

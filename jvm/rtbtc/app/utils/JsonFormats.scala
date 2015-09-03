package utils
import play.api.mvc.WebSocket.FrameFormatter
import play.api.libs.json._
import scala.util.control.NonFatal
import utils.Events._
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

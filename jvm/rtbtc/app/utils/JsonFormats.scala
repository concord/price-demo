package utils
import play.api.mvc.WebSocket.FrameFormatter
import play.api.libs.json._
import scala.util.control.NonFatal

object JsonFormats {
  import utils.Events._
  implicit val registrationFormat = Json.format[GraphEventRegistration]
  implicit val registrationFrame: FrameFormatter[GraphEventRegistration] =
    FrameFormatter
      .stringFrame
      .transform(_.toString, Json.parse(_)
        .as[GraphEventRegistration])

  implicit val eventJsonFormat = Json.format[GraphEventPoint]
  implicit val eventFrame: FrameFormatter[GraphEventPoint] =
    FrameFormatter
      .stringFrame
      .transform(_.toString, Json.parse(_)
        .as[GraphEventPoint])

  implicit val myJsonFrame: FrameFormatter[JsValue] =
    implicitly[FrameFormatter[String]].transform(Json.stringify, { text =>
      try {
        Json.parse(text)
      } catch {
        case NonFatal(e) => Json.obj("error" -> e.getMessage)
      }
    })

  implicit val dashboardFormat = Json.format[DashboardData]
  implicit val dashboardFrame: FrameFormatter[DashboardData] =
    FrameFormatter
      .stringFrame
      .transform(_.toString, Json.parse(_)
        .as[DashboardData])
}

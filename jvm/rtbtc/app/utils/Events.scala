package utils

object Events {
  case class GraphEventRegistration(topic: String)
  case class GraphEventPoint(topic: String, sell: Double, buy: Double, volume: Double)
}

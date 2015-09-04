package utils

object Events {
  case class GraphEventRegistration(topic: String)
  // close: 19.51
  // date: Wed Jan 07 2009 00:00:00 GMT-0500 (EST)
  // high: 20.29
  // low: 19.48
  // open: 20.19
  // volume: 72709900
  case class GraphEventPoint(
    topic: String,
    action: String,
    date: Long,
    volume: Double,
    open: Double,
    close: Double,
    high: Double,
    low: Double)

  // Contains a bunch of optional types that can be send to the
  // clients. basically a big map, that is tyepsafe
  case class DashboardData(graphs: Option[List[GraphEventPoint]])
}

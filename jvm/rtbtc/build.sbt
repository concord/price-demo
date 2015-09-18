name := """rtbtc"""

version := "1.0-SNAPSHOT"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

scalaVersion := "2.11.6"

libraryDependencies ++= Seq(
  jdbc,
  cache,
  ws,
  specs2 % Test,
  "org.apache.kafka" %% "kafka"  % "0.8.2.0" exclude("log4j", "log4j") exclude("org.slf4j","slf4j-log4j12"),
  "com.typesafe.scala-logging" %% "scala-logging" % "3.1.0"

)

resolvers += "scalaz-bintray" at "http://dl.bintray.com/scalaz/releases"

// Play provides two styles of routers, one expects its actions to be injected, the
// other, legacy style, accesses its actions statically.
routesGenerator := InjectedRoutesGenerator

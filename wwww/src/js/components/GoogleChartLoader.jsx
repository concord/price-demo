//GoogleChartLoader Singleton
// Based on http://blog.arkency.com/2014/09/react-dot-js-and-google-charts/
import q from 'q';
import jquery from 'jquery';


class GoogleChartLoader  {
  constructor(){
    this.isLoading = true;
    this.q = q.defer();
    let options = {
      dataType: "script",
      cache: true,
      url: "https://www.google.com/jsapi"
    };
    jquery.ajax(options).done(() => {
      window.google.load("visualization", "1", {
        packages: ["corechart"],
        callback: () => {
          this.isLoading = false;
          this.q.resolve();
        }
      });
    });

  }

};

let loader = new GoogleChartLoader;
class GoogleChartSingleton {
  static promise() {
    return loader.q.promise;
  }
}

export default GoogleChartSingleton;

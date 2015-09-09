//GoogleChartLoader Singleton
// Based on http://blog.arkency.com/2014/09/react-dot-js-and-google-charts/
import q from 'q';
import jquery from 'jquery';


class GoogleChartLoader  {
  constructor(){
    this.isLoading = true;
    let options = {
      dataType: "script",
      cache: true,
      url: "https://www.google.com/jsapi"
    };
    $.ajax(options).done(() => {
      window.google.load("visualization", "1", {
        packages: ["corechart"],
        callback: () => {
          this.isLoading = false;
          this.promise.resolve();
        }
      });
    });

  }
  isReady() {
    return !this.isLoading;
  }

};

let loader = new GoogleChartLoader;

class GoogleChartSingleton {
  static isGoogleChartLoaded() {
    return loader.isReady();
  }
}

export default GoogleChartSingleton;

class GenericGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
  }

  getFields() {
    return [
      {name: 'country', title: "Country", type: "text", width: 40},
      {name: 'tier', title: "Tier", type: "number", width: 18},
      {name: 'version', title: "Version", type: "text", width: 25},
      {name: 'density', title: "Geo Density", type: "number", width: 40},
      {name: 'accuracy', title: "Geo Accuracy", type: "number", width: 45},
      {name: 'goal', title: "Goal", type: "number", width: 20},
      {name: 'comprehensiveness', title: "Geo Comprehensiveness", type: "number", width: 70},
      {name: 'geolevelDensity', title: "Geolevel Density", type: "number", width: 60},
      {name: 'geolevelConfidence', title: "Geo Confidence", type: "number", width: 60},
      {name: 'geocoder', title: "Geocoder", type: "text", width: 35}
    ];
  }

  getDataUrl() {
    return $('#genericStorage').attr('generic-data-url');
  }

  getChartUrl() {
    return $('#genericStorage').attr('chart-url');
  }
}

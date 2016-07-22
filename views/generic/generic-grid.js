class GenericGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
  }

  getFields() {
    let urlFieldName = 'urlField';
    let urlFieldConfig = {
      itemTemplate: function(value, item) {
        return $('<a href="/chart/' + item.countryCode.toString() + '", target="_blank">' + value.toString() + '</a>');
      }
    };
    this.setCustomizedField(urlFieldConfig, urlFieldName);

    let accuracyFieldName = 'accuracyField';
    let accuracyFieldConfig = {
      itemTemplate: function(value, item) {
        let result = value;
        if (value < item.goal) {
          result = '<font color="red">' + value.toString() + '</font>';
        }
        return result;
      }
    };
    this.setCustomizedField(accuracyFieldConfig, accuracyFieldName);

    return [
      {name: 'country', title: "Country", type: urlFieldName, align: 'left', width: 40},
      {name: 'tier', title: "Tier", type: "number", align: 'right', width: 18},
      {name: 'version', title: "Version", type: "text", align: 'right', width: 25},
      {name: 'density', title: "Geo Density", type: "number", align: 'right', width: 40},
      {name: 'accuracy', title: "Geo Accuracy", type: accuracyFieldName, align: 'right', width: 45},
      {name: 'goal', title: "Goal", type: "number", align: 'right', width: 20},
      {name: 'comprehensiveness', title: "Geo Comprehensiveness", type: "number", align: 'right', width: 70},
      {name: 'geolevelDensity', title: "Geolevel Density", type: "number", align: 'right', width: 60},
      {name: 'geolevelConfidence', title: "Geo Confidence", type: "number", align: 'right', width: 60},
      {name: 'geocoder', title: "Geocoder", type: "text", align: 'center', width: 35}
    ];
  }

  getDataUrl() {
    return $('#genericStorage').attr('generic-data-url');
  }

  getChartUrl() {
    return $('#genericStorage').attr('chart-url');
  }
}

class GeosummarizerGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
  }

  getFields() {
    let runFieldName = 'runField';
    let runFieldConfig = {
      itemTemplate: function(value, item) {
        let btnStyleClass = value === item.version ? 'btn-success' : 'btn-warning';
        return ($(`<button type="button" class="btn ${btnStyleClass}">Run for ${value}</button>`));
      }
    };
    this.setCustomizedField(runFieldConfig, runFieldName);

    return [
      { name: 'countryName', title: "Country", type: "text", width: 32 },
      { name: 'tier', title: "Tier", type: "number", width: 20 },
      { name: 'version', title: "Version", type: "text", width: 30 },
      { name: 'geosumAccuracy', title: "Geosummarizer Accuracy", type: "number", width: 80 },
      { name: 'geosumRate', title: "Good Geosummarizer Rate", type: "number", width: 85 },
      { name: 'inputRate', title: "Ideal Input Rate", type: "number", width: 55 },
      { name: 'inputSD', title: "Ideal Input Standard Deviation", type: "number", width: 90 },
      { name: 'inputAccuracy', title: "Input Accuracy", type: "number", width: 50 },
      { name: 'liveVersion', title: "Run", type: runFieldName, width: 30 }
    ];
  }

  getDataUrl() {
    return $('#geosummarizerStorage').attr('geosummarizer-data-url');
  }
}

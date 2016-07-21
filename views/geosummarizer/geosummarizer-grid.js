class GeosummarizerGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
  }

  getFields() {
    return [
      { name: 'country', title: "Country", type: "text", width: 30, validate: "required" },
      { name: 'tier', title: "Tier", type: "number", width: 20 },
      { name: 'version', title: "Version", type: "text", width: 30 },
      { name: 'geosumAccuracy', title: "Geosummarizer Accuracy", type: "number", width: 100 },
      { name: 'geosumRate', title: "Good Geosummarizer Rate", type: "number", width: 100 },
      { name: 'inputRate', title: "Ideal Input Rate", type: "number", width: 80 },
      { name: 'inputSD', title: "Ideal Input Standard Deviation", type: "number", width: 120 },
      { name: 'inputAccuracy', title: "Input Accuracy", type: "number", width: 80 },
    ];
  }

  getDataUrl() {
    return $('#geosummarizerStorage').attr('geosummarizer-data-url');
  }
}

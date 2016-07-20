class GeosummarizerGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
  }

  getFields() {
    return [
      { name: "Country", type: "text", width: 30, validate: "required" },
      { name: "Tier", type: "number", width: 20 },
      { name: "Version", type: "text", width: 30 },
      { name: "Geosummarizer Accuracy", type: "number", width: 100 },
      { name: "Good Geosummarizer Rate", type: "number", width: 100 },
      { name: "Ideal Input Rate", type: "number", width: 80 },
      { name: "Ideal Input Standard Deviation", type: "number", width: 120 },
      { name: "Input Accuracy", type: "number", width: 80 },
    ];
  }

  getDataUrl() {
    return $('#geosummarizerStorage').attr('geosummarizer-data-url');
  }
}

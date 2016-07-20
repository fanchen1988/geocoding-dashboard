class GenericGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
  }

  getFields() {
    return [
      { name: "Name", type: "text", width: 150, validate: "required" },
      { name: "Age", type: "number", width: 50 },
      { name: "Address", type: "text", width: 200 },
      //{ name: "Country", type: "select", items: countries, valueField: "Id", textField: "Name" },
      { name: "Married", type: "checkbox", title: "Is Married", sorting: false },
      { type: "control" }
    ];
  }

  getDataUrl() {
    return $('#genericStorage').attr('generic-data-url');
  }

  getChartUrl() {
    return $('#genericStorage').attr('chart-url');
  }
}

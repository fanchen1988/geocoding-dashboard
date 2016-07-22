class GeosummarizerGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
    this.vineyardTaskUrlPrefix = 'http://vineyard.prod.factual.com/task/';
  }

  getFields() {
    let runFieldName = 'runField';
    let runFieldConfig = {
      itemTemplate: function(value, item) {
        let btnStyleClass = value === item.version ? 'btn-success' : 'btn-warning';
        let code = item.countryCode;
        let liveVersion = item.liveVersion;
        let dataset = item.dataset;
        return ($(`<button country-code="${code}" run-version="${liveVersion}" dataset="${dataset}" type="button" class="btn ${btnStyleClass} btn-run">Run for ${value}</button>`));
      }
    };
    this.setCustomizedField(runFieldConfig, runFieldName);

    return [
      { name: 'countryName', title: "Country", type: "text", align: 'left', width: 32 },
      { name: 'tier', title: "Tier", type: "number", align: 'right', width: 20 },
      { name: 'version', title: "Version", type: "text", align: 'right', width: 30 },
      { name: 'geosumAccuracy', title: "Geosummarizer Accuracy", type: "number", align: 'right', width: 50 },
      { name: 'geosumRate', title: "Good Geosummarizer Rate", type: "number", align: 'right', width: 50 },
      { name: 'inputRate', title: "Ideal Input Rate", type: "number", align: 'right', width: 35 },
      { name: 'inputSD', title: "Ideal Input Standard Deviation", type: "number", align: 'right', width: 50 },
      { name: 'inputAccuracy', title: "Input Accuracy", type: "number", align: 'right', width: 30 },
      { name: 'liveVersion', title: "Run", type: runFieldName, align: 'center', width: 30 }
    ];
  }

  getOnDataLoaded(grid, data) {
    return () => {
      $('.btn-run').off('click').on('click', (e) => {
        let countryCode = $(e.target).attr('country-code');
        let runVersion = $(e.target).attr('run-version');
        let dataset = $(e.target).attr('dataset');
        let runUrl = this.getRunUrl();
        $.post(runUrl, {countryCode, runVersion, dataset}, (data) => {
          alert(this.vineyardTaskUrlPrefix + data.taskId);
        });
      });
    };
  }

  getCustomizedConfig() {
    return {onDataLoaded: this.getOnDataLoaded()};
  }

  getDataUrl() {
    return $('#geosummarizerStorage').attr('geosummarizer-data-url');
  }

  getRunUrl() {
    return $('#geosummarizerStorage').attr('geosummarizer-run-rul');
  }
}

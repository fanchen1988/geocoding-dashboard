class GeosummarizerGrid extends GridLoader {

  setInitConfig() {
    super.setInitConfig();
    this.fields = this.getFields();
    this.vineyardTaskUrlPrefix = 'http://vineyard.prod.factual.com/task/';
    this.taskRunDisableMapping = {
      'RUNNING': true,
      'PENDING': true,
      'ERROR': false,
      'DONE': false
    };
  }

  getFields() {
    let taskFieldName = 'taskField';
    let taskFieldConfig = {
      itemTemplate: (value, item) => {
        let taskId = value;
        let status = item.taskStatus;
        if (!taskId) {
          return null;
        }
        let display = status ? status : taskId;
        let link = this.vineyardTaskUrlPrefix + taskId;
        return ($('<a href="' + link + '", target="_blank">' + display + '</a>'));
      }
    };
    this.setCustomizedField(taskFieldName, taskFieldConfig);

    let runFieldName = 'runField';
    let runFieldConfig = {
      itemTemplate: (value, item) => {
        let btnStyleClass = value === item.version ? 'btn-success' : 'btn-warning';
        btnStyleClass = `btn ${btnStyleClass} btn-run`;
        let code = item.countryCode;
        let liveVersion = item.liveVersion;
        let dataset = item.dataset;
        let btnTag = `<button country-code="${code}" run-version="${liveVersion}" dataset="${dataset}" type="button" class="${btnStyleClass} btn-xs"`;
        if (this.taskRunDisableMapping[item.taskStatus]) {
          btnTag += ' disabled';
        }
        return ($(`${btnTag}>Run for ${value}</button>`));
      }
    };
    this.setCustomizedField(runFieldName, runFieldConfig);

    return [
      { name: 'countryName', title: "Country", type: "text", align: 'left', width: 32 },
      { name: 'tier', title: "Tier", type: "number", align: 'right', width: 20 },
      { name: 'version', title: "Version", type: "text", align: 'right', width: 30 },
      { name: 'geosumAccuracy', title: "Geosummarizer Accuracy", type: "number", align: 'right', width: 50 },
      { name: 'geosumRate', title: "Good Geosummarizer Rate", type: "number", align: 'right', width: 50 },
      { name: 'inputRate', title: "Ideal Input Rate", type: "number", align: 'right', width: 35 },
      { name: 'inputSD', title: "Ideal Input Standard Deviation", type: "number", align: 'right', width: 50 },
      { name: 'inputAccuracy', title: "Input Accuracy", type: "number", align: 'right', width: 30 },
      { name: 'taskId', title: "Current Task", type: taskFieldName, align: 'center', width: 30 },
      { name: 'liveVersion', title: "Run", type: runFieldName, align: 'center', sorting: false, width: 30 }
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
          $('#geosummarizerBody').jsGrid('render');
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

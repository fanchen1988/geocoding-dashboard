class GridLoader {

  constructor() {
    this.setInitConfig();
  }

  setInitConfig() {
    this.width = '100%';
    this.height = '500px';
    this.sorting = true;
    this.autoload = true;
    this.fields = [];
  }

  loadGrid(gridHoldTagSelector) {
    gridHoldTagSelector.jsGrid(this.getJsGridConfig());
  }

  getJsGridConfig() {
    return {
      width: this.width,
      height: this.height,
      sorting: this.sorting,
      autoload: this.autoload,
      controller: this.getController(),
      fields: this.getFields()
    }
  }

  getController() {
    return {loadData: this.getDataLoader()};
  }

  getDataLoader() {
    return () => {
      var deferred = $.Deferred();
      $.ajax({
        url: this.getDataUrl(),
        dataType: 'json',
        success: this.getFetchDataHandler(deferred)
      });
      return deferred.promise();
    };
  }

  getFetchDataHandler(deferred) {
    return (data) => {
      console.log(data);
      deferred.resolve(data);
    };
  }
}

class GridLoader {

  constructor() {
    this.setInitConfig();
    this.setRoundNumField(3);
  }

  setRoundNumField(digit) {
    let roundFixed = Math.pow(10, digit);
    let numFieldName = 'number';
    let numFieldConfig = {
      itemTemplate: function(value, item) {
        return Math.round(value * roundFixed) / roundFixed;
      }
    };
    this.setCustomizedField(numFieldName, numFieldConfig);
  }

  setInitConfig() {
    this.width = '100%';
    this.height = 'auto';
    this.sorting = true;
    this.autoload = true;
    this.fields = [];
  }

  loadGrid(gridHoldTagSelector) {
    gridHoldTagSelector.jsGrid(this.getJsGridConfig());
  }

  getJsGridConfig() {
    let gridConfig = {
      width: this.width,
      height: this.height,
      sorting: this.sorting,
      autoload: this.autoload,
      controller: this.getController(),
      rowRenderer: this.getRowRenderer(),
      fields: this.getFields()
    }
    return $.extend(gridConfig, this.getCustomizedConfig());
  }

  getController() {
    return {loadData: this.getDataLoader()};
  }

  getRowRenderer() {
    return null;
  }

  getCustomizedConfig() {
    return null;
  }

  getOnDataLoaded() {
    return null;
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

  setCustomizedField(customizeName, fieldCfg) {
    let customizedField = function(config) {
      jsGrid.Field.call(this, config);
    };
    customizedField.prototype = new jsGrid.Field(fieldCfg);
    jsGrid.fields[customizeName] = customizedField;
  }
}


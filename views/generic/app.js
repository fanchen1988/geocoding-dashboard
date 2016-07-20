function loadPage() {
  loadJsGrid();
}

function loadJsGrid() {
  $("#genericBody").jsGrid({
    width: "100%",
    height: "400px",
    autoload: true,

    controller: {
      loadData: loadGenericData
    },

    fields: getFieldConfig()
  });
}

function loadGenericData() {
  var deferred = $.Deferred();
  $.ajax({
    url: getGenericDataUrl(),
    dataType: 'json',
    success: function(data) {
      console.log(data);
      deferred.resolve(data);
    }
  });
  return deferred.promise();
}

function getFieldConfig() {
  return [
    { name: "Name", type: "text", width: 150, validate: "required" },
    { name: "Age", type: "number", width: 50 },
    { name: "Address", type: "text", width: 200 },
    //{ name: "Country", type: "select", items: countries, valueField: "Id", textField: "Name" },
    { name: "Married", type: "checkbox", title: "Is Married", sorting: false },
    { type: "control" }
  ];
}

function getGenericDataUrl() {
  return $('#genericStorage').attr('generic-data-url');
}

function getChartUrl() {
  return $('#genericStorage').attr('chart-url');
}


function loadPage() {
  loadData((data) => {
    data = JSON.parse(data);
    console.log(data);
    loadChart(data);
  });
}

function getLabels(records) {
  return records.map((item) => {
    return item.version;
  });
}

function getDensityDataset(records) {
  let label = 'Density';
  let backgroundColor = 'rgba(0,0,0,0.0)';
  let borderColor = 'rgba(255,99,132,1)';
  let borderWidth = 2;
  let data = records.map((item) => {
    return item.density;
  });
  return {label, backgroundColor, borderColor, borderWidth, data};
}

function getAccuracyDataset(records) {
  let label = 'Accuracy';
  let backgroundColor = 'rgba(0,0,0,0.0)';
  let borderColor = 'rgba(54, 162, 235, 1)';
  let borderWidth = 2;
  let data = records.map((item) => {
    return item.accuracy;
  });
  return {label, backgroundColor, borderColor, borderWidth, data};
}

function getComprehensiveDataset(records) {
  let label = 'Comprehensiveness';
  let backgroundColor = 'rgba(0,0,0,0.0)';
  let borderColor = 'rgba(255, 206, 86, 1)';
  let borderWidth = 2;
  let data = records.map((item) => {
    return item.comprehensiveness;
  });
  return {label, backgroundColor, borderColor, borderWidth, data};
}

function getOptions(records) {
  return {
    scales: {yAxes: [{ticks: {beginAtZero: false}}]},
    title: {
      display:true,
      text: records[0].country,
      fontSize: 20
    }
  };
}

function loadChart(records) {
  var ctx = $("#chartBody");
  var chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: getLabels(records),
      datasets: [
        getDensityDataset(records),
        getAccuracyDataset(records),
        getComprehensiveDataset(records)
      ]
    },
    options: getOptions(records)
  });
}

function loadData(cb) {
  $.get(getDataUrl(), cb);
}

function getDataUrl() {
  return $('#chartStorage').attr('chart-data-url');
}


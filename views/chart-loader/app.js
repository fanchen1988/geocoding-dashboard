function loadPage() {
  var ctx = $("#chartBody");
  var myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ["3.41", "3.42","3.43"],
      datasets: [{
        label: 'Density',
        data: [0.948, 0.936, 0.939],
        backgroundColor: 'rgba(0,0,0,0.0)',
        borderColor: 'rgba(255,99,132,1)',
        borderWidth: 1
      },
      {
        label: 'Accuracy',
        data: [0.7785, 0.7848, 0.7859],
        backgroundColor: 'rgba(0,0,0,0.0)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      {
        label: 'Comprehensiveness',
        data: [0.9864, 0.9805, 0.9807],
        backgroundColor: 'rgba(0,0,0,0.0)',
        borderColor: 'rgba(255, 206, 86, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            beginAtZero: false
          }
        }]
      }
    }
  });
}

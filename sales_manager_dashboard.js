frappe.pages["sales-manager-dashboard"].on_page_load = function (wrapper) {
  var page = frappe.ui.make_app_page({
    parent: wrapper,
    title: "Sales Manager Dashboard",
    single_column: true,
  });

  server_call.fetch_data(page);
};

server_call = {
  fetch_data: function (page) {
    frappe.call({
      method:
        "erpnext.crm.page.sales_manager_dashboard.sales_manager_dashboard.get_information",
      args: {},
      callback: function (r) {
        var info = r.message;
        console.log(info);

        $("#sales_manager_dashboard").remove();
        const content = frappe.render_template("sales_manager_dashboard", info);
        const main = page.main;
        $(content).appendTo(main);
        _highcharts_.load_charts(info);
      },
    });
  },
};

/// ===> Rendering CHARTS in HTML <=== ///

_highcharts_ = {
  load_charts: function (info) {
    _highcharts_.closed_won();
    _highcharts_.totalAmount_stage(info.stage_chart);
    _highcharts_.topAccounts_won(info.topwon_chart);
    _highcharts_.topAcounts_open(info.topAcounts_open_chart);
    _highcharts_.amount_won_type(info.amount_won_type_chart);
    _highcharts_.closed_won_rep(info.closed_won_rep_chart);
    _highcharts_.closed_won80_rep(info.closed_won80_rep_chart);
    _highcharts_.closed_lost_reason(info.closed_lost_reason_chart);
    _highcharts_.wl_ratio_rep(info.winloss_ratio_chart);
    _highcharts_.last_activity(info.last_activity_chart);
  },

  totalAmount_stage: function (data) {
    let chart_js = highChart_2(data);
    $("#totalAmount_stage").html(chart_js);
  },

  closed_won: function () {
    let chart_js = highChart_3();
    $("#closed_won").html(chart_js);
  },

  topAccounts_won: function (data) {
    let chart_js = highChart_4(data);
    $("#topAccounts_won").html(chart_js);
  },

  topAcounts_open: function (data) {
    let chart_js = highChart_5(data);
    $("#topAcounts_open").html(chart_js);
  },

  amount_won_type: function (data) {
    let chart_js = highChart_6(data);
    $("#amount_won_type").html(chart_js);
  },

  closed_won_rep: function (data) {
    let chart_js = highChart_7(data);
    $("#closed_won_rep").html(chart_js);
  },

  closed_won80_rep: function (data) {
    let chart_js = highChart_8(data);
    $("#closed_won80_rep").html(chart_js);
  },

  closed_lost_reason: function (data) {
    let chart_js = highChart_9(data);
    $("#closed_lost_reason").html(chart_js);
  },

  wl_ratio_rep: function (data) {
    let chart_js = highChart_10(data);
    $("#wl_ratio_rep").html(chart_js);
  },

  last_activity: function (data) {
    let chart_js = highChart_11(data);
    $("#last_activity").html(chart_js);
  },
};

/// ===> CHART SCRIPTS <=== ///

function highChart_2(data) {
  return `<script>
      Highcharts.chart('totalAmount_stage', {
          chart: {
              type: 'funnel'
          },
          title: {
              text: 'Sales funnel'
          },
          plotOptions: {
              series: {
                  dataLabels: {
                      enabled: true,
                      format: '<b>{point.name}</b> ({point.y:,.0f})',
                      softConnector: true
                  },
                  center: ['40%', '50%'],
                  neckWidth: '10%',
                  neckHeight: '0%',
                  width: '35%'
              }
          },
          legend: {
              enabled: false
          },
          series: [{
              name: 'Stage',
              data: ${JSON.stringify(data)}
          }],
      
          responsive: {
              rules: [{
                  condition: {
                      maxWidth: 500
                  },
                  chartOptions: {
                      plotOptions: {
                          series: {
                              dataLabels: {
                                  inside: true
                              },
                              center: ['50%', '50%'],
                              width: '100%'
                          }
                      }
                  }
              }]
          }
      });
      </script>
      `;
}

function highChart_3() {
  return `<script>
      Highcharts.chart('closed_won', {
  
          chart: {
              type: 'item'
          },
      
          title: {
              text: 'Closed Won + ≥80%'
          },
      
          subtitle: {
              text: 'Parliament visualization'
          },
      
          legend: {
              labelFormat: '{name} <span style="opacity: 0.4">{y}</span>'
          },
      
          series: [{
              name: 'Representatives',
              keys: ['name', 'y', 'color', 'label'],
              data: [
                  ['The Left', 69, '#BE3075', 'DIE LINKE'],
                  ['Social Democratic Party', 153, '#EB001F', 'SPD'],
                  ['Alliance 90/The Greens', 67, '#64A12D', 'GRÜNE'],
                  ['Free Democratic Party', 80, '#FFED00', 'FDP'],
                  ['Christian Democratic Union', 200, '#000000', 'CDU'],
                  ['Christian Social Union in Bavaria', 46, '#008AC5', 'CSU'],
                  ['Alternative for Germany', 94, '#009EE0', 'AfD']
              ],
              dataLabels: {
                  enabled: true,
                  format: '{point.label}'
              },
      
              // Circular options
              center: ['50%', '88%'],
              size: '170%',
              startAngle: -100,
              endAngle: 100
          }]
      
      });
      </script>`;
}

function highChart_4(data) {
  return `<script>
  Highcharts.chart('topAccounts_won', {
    chart: {
        type: 'bar',
        zoomType: 'y'
    },
    title: {
        text: 'Top Accounts - Won'
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        categories: ${JSON.stringify(data.categories)},
        title: {
            text: null
        },
        accessibility: {
            description: 'Countries'
        }
    },
    yAxis: {
        min: 0,
        max: 500000,
        tickInterval: 50000,
        title: {
            text: null
        },
        accessibility: {
            description: '',
            rangeDescription: 'Range: 0 to 300k.'
        },
        labels: {
            overflow: 'justify',
            format: '{value}'
        }
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true,
                format: '{y}'
            }
        }
    },
    tooltip: {
        valueSuffix: '',
        stickOnContact: true,
        backgroundColor: 'rgba(255, 255, 255, 0.93)'
    },
    legend: {
        enabled: false
    },
    series: [
        {
            name: 'Sum of Amounts',
            color: '#a5d6a7',
            borderColor: '#60A465',
            data: ${JSON.stringify(data.data)}
        }
    ]
});
  </script>`;
}

function highChart_5(data) {
  return `<script>
  Highcharts.chart('topAcounts_open', {
    chart: {
        type: 'bar',
        zoomType: 'y'
    },
    title: {
        text: 'Top Accounts - Open'
    },
    subtitle: {
        text: ''
    },
    xAxis: {
        categories: ${JSON.stringify(data.categories)},
        title: {
            text: null
        },
        accessibility: {
            description: 'Countries'
        }
    },
    yAxis: {
        min: 0,
        max: 500000,
        tickInterval: 50000,
        title: {
            text: null
        },
        accessibility: {
            description: '',
            rangeDescription: 'Range: 0 to 500k.'
        },
        labels: {
            overflow: 'justify',
            format: '{value}'
        }
    },
    plotOptions: {
        bar: {
            dataLabels: {
                enabled: true,
                format: '{y}'
            }
        }
    },
    tooltip: {
        valueSuffix: '',
        stickOnContact: true,
        backgroundColor: 'rgba(255, 255, 255, 0.93)'
    },
    legend: {
        enabled: false
    },
    series: [
        {
            name: 'Sum of Amounts',
            color: '#a5d6a7',
            borderColor: '#60A465',
            data: ${JSON.stringify(data.data)}
        }
    ]
});
  </script>`;
}

function highChart_6(data) {
  return `<script>
    Highcharts.chart('amount_won_type', {
      chart: {
          type: 'column',
          zoomType: 'y'
      },
      title: {
          text: 'Amount Won by Type, FQ Comparison',
          align: 'left'
      },
      xAxis: {
          categories: ${JSON.stringify(data.categories)},
          title: {
              text: null
          },
          accessibility: {
              description: 'Business Type'
          }
      },
      yAxis: {
          min: 0,
          tickInterval: 10000,
          title: {
              text: 'Sum of Amount'
          }
      },
      plotOptions: {
          column: {
              dataLabels: {
                  enabled: true,
                  format: '{y} rupees'
              }
          }
      },
      tooltip: {
          valueSuffix: ' rupees',
          stickOnContact: true,
          backgroundColor: 'rgba(255, 255, 255, 0.93)'
      },
      legend: {
          enabled: false
      },
      series: [
          {
              name: '',
              data: ${JSON.stringify(data.data)},
              borderColor: '#5997DE'
          }
      ]
  });
      </script>`;
}

// closed_won_rep
// Closed Won by Rep
// ${JSON.stringify(data)}

function highChart_7(data) {
  return `<script>
  Highcharts.setOptions({
    colors: ['#71BF45', '#FAA74B', '#01BAF2', '#f23901', '#A0A0A0']
});

Highcharts.chart('closed_won_rep', {
    chart: {
        type: 'bar'
    },
    title: {
        text: 'Closed Won by Rep'
    },
    xAxis: {
        categories: ${JSON.stringify(data.categories)},
        visible: false
    },
    yAxis: {
        labels: {
            enabled: false
        },
        visible: false,
        // reversed: true,
        min: 0,
        title: {
            text: null
        }
    },
    tooltip: {
        pointFormat:
      '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}%</b><br/>',
        shared: true
    },
    plotOptions: {
        bar: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                format: '{series.name}: {y}%',
                color: 'black',
                rotation: -55,
                y: -100,
                x: 30
            }
        }
    },
    series: ${JSON.stringify(data.data)}
});
      </script>`;
}

// closed_won80_rep
function highChart_8(data) {
  return `<script>
  Highcharts.setOptions({
    colors: ['#71BF45', '#FAA74B', '#01BAF2', '#f23901', '#A0A0A0']
});

Highcharts.chart('closed_won80_rep', {
    chart: {
        type: 'bar'
    },
    title: {
        text: 'Closed Won + ≥80% by Rep'
    },
    xAxis: {
        categories: ${JSON.stringify(data.categories)},
        visible: false
    },
    yAxis: {
        labels: {
            enabled: false
        },
        visible: false,
        // reversed: true,
        min: 0,
        title: {
            text: null
        }
    },
    tooltip: {
        pointFormat:
      '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.0f}%</b><br/>',
        shared: true
    },
    plotOptions: {
        bar: {
            stacking: 'percent',
            dataLabels: {
                enabled: true,
                format: '{series.name}: {y}%',
                color: 'black',
                rotation: -55,
                y: -100,
                x: 30
            }
        }
    },
    series: ${JSON.stringify(data.data)}
});
      </script>`;
}

function highChart_9(data) {
  return `<script>
    Highcharts.chart('closed_lost_reason', {
      chart: {
          type: 'column',
          zoomType: 'y'
      },
      title: {
          text: 'Closed Lost by Reason, FQ Comparison',
          align: 'left'
      },
      xAxis: {
          categories: ${JSON.stringify(data.categories)},
          title: {
              text: null
          },
          accessibility: {
              description: 'Lost Reason'
          }
      },
      yAxis: {
          min: 0,
          tickInterval: 10000,
          title: {
              text: 'Sum of Amount'
          }
      },
      plotOptions: {
          column: {
              dataLabels: {
                  enabled: true,
                  format: '{y} rupees'
              }
          }
      },
      tooltip: {
          valueSuffix: ' rupees',
          stickOnContact: true,
          backgroundColor: 'rgba(255, 255, 255, 0.93)'
      },
      legend: {
          enabled: false
      },
      series: [
          {
              name: '',
              data: ${JSON.stringify(data.data)},
              borderColor: '#5997DE'
          }
      ]
  });
      </script>`;
}

function highChart_10(data) {
  return `<script>
      Highcharts.setOptions({
          chart: {
              inverted: false,
              marginLeft: 85,
              type: 'bullet'
          },
          title: {
              text: null
          },
          legend: {
              enabled: false
          },
          yAxis: {
              gridLineWidth: 0
          },
          plotOptions: {
              series: {
                  pointPadding: 0.25,
                  borderWidth: 0,
                  color: '#9dcbfa',
                  targetOptions: {
                      width: '200%'
                  }
              }
          },
          credits: {
              enabled: false
          },
          exporting: {
              enabled: false
          }
      });
      
      Highcharts.chart('wl_ratio_rep', {
          chart: {
              marginTop: 40
          },
          title: {
              text: 'Win/Loss Ratio by Rep'
          },
          xAxis: {
              categories: ${JSON.stringify(data.categories)},
          },
          yAxis: {
              plotBands: [{
                  from: 0,
                  to: 100,
                  color: '#666'
              }, {
                  from: 100,
                  to: 200,
                  color: '#999'
              }, {
                  from: 200,
                  to: 9e9,
                  color: '#bbb'
              }],
              title: 'Win/Loss Ratio'
          },
          series: [{
              data: ${JSON.stringify(data.data)}
          }],
          tooltip: {
              pointFormat: '<b>{point.y}</b>'
          }
      });
  </script>`;
}

function highChart_11(data) {
  return `<script>
      Highcharts.chart('last_activity', {
          chart: {
              type: 'column'
          },
          title: {
              text: 'Last Activity >96 Hours, by Probability',
              align: 'left'
          },
          subtitle: {
              text: ''
          },
          xAxis: {
              categories: ${JSON.stringify(data.categories)},
              crosshair: true,
              title: {
                  text: 'Probability'
              }
          },
          yAxis: {
              min: 0,
              title: {
                  text: 'Activity Count'
              }
          },
          tooltip: {
              headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
              pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
                  '<td style="padding:0"><b>{point.y:.1f} record</b></td></tr>',
              footerFormat: '</table>',
              shared: true,
              useHTML: true
          },
          plotOptions: {
              column: {
                  pointPadding: 0,
                  borderWidth: 0,
                  groupPadding: 0,
                  shadow: false
              }
          },
          series: [{
              name: 'Record Count',
              data: ${JSON.stringify(data.data)},
      
          }]
      });
      </script>`;
}

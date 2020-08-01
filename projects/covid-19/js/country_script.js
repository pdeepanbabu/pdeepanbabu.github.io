var countryOptions = {
    series: [{
    data: [1]
  }],
    chart: {
    type: 'area',
    height: 378,
    sparkline: {
      enabled: false
    },
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 1
  },
  fill: {
    opacity: 0.3,
  },
  yaxis: {
    min: 0
  },
  xaxis: {
    type: 'datetime',
  },
  colors:[],
  title: {
    text: '$424,652',
    offsetX: 0,
    style: {
      fontSize: '24px',
    }
  },
  };   

  const url = (window.location.href).split('#')
  let country = url[1]
  let covid_Data;


  async function fetchAPI(url){
      const resp = await fetch(url)
      const data = await resp.json()
      return data
  }


  function sepNum(r,e){return e=e||",",r=String(r).replace(/[\u0660-\u0669\u06f0-\u06f9]/g,function(r){return 15&r.charCodeAt(0)}).replace(/(?:[^\.]|^)\b(\d+)/g,function(r){return r=r.replace(/\B(?=(\d{3})+\b)/g,e)})}


  async function getCountryData(c){
    $body = $("body");
    await $body.addClass("loading");

    const data = covid_Data[c]['data']
    updateCountrydData(data)
    createCountryTable(data, 'country-table', ['date', 'total_cases', 'total_deaths', 'new_cases','new_deaths'])
    updateCountryChart(data)
    
    await $body.removeClass("loading"); 
  }

  async function updateCountryList(){
    covid_Data = await fetchAPI("/projects/covid-19/data/owid-covid-data.json")
    const keys = Object.keys(covid_Data)
    data = ''
    keys.forEach(element => {
      data += `<option value="${element}">${covid_Data[element]['location']}</option>`
    });
    const c = document.getElementById('country')
    c.innerHTML = data
    c.value = country
  }

  function updateCountryChart(data){
    const plot = ['total_cases', 'new_cases']
    // const colors = ['#ff1744', '#ff9800', '#482880', '#000000']
    const colors = ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800']
    let index = 0;

    const totChart = document.getElementById('chart')
    totChart.innerHTML = ""

    let totalChart = JSON.parse(JSON.stringify(countryOptions))
    totalChart.title.text = ''
    totalChart.xaxis.categories = getCountrycolumns(data, 'date')
    totalChart.colors = colors
    totalChart.stroke.width = 1.5
    totalChart.yaxis = [
    {
      title: {
        text: '',
      },
    },
    {
      opposite: true,
      title: {
        text: '',
      },
    },
  ];
    totalChart.series = [{
      data: getCountrycolumns(data, 'total_cases'),
      name: 'Total Cases',
      type: 'area'
    },
    {
      data: getCountrycolumns(data, 'new_cases'),
      name: 'New Cases',
      type: 'area'
    },
    {
      data: getCountrycolumns(data, 'total_deaths'),
      name: 'Total Deaths',
      type: 'area'
    },
    {
      data: getCountrycolumns(data, 'new_deaths'),
      name: 'New Deaths',
      type: 'area'
    }]
    var chart = new ApexCharts(document.querySelector(`#chart`), totalChart);
    chart.render();
    
    plot.forEach(element => {
      const plotDiv = document.getElementById(`${element}_chart`)
      plotDiv.innerHTML = ''
      let plotOptions = JSON.parse(JSON.stringify(countryOptions))
      plotOptions.title.text = ''
      plotOptions.series[0].name = element
      plotOptions.colors[0] = colors[index]
      plotOptions.xaxis.categories = getCountrycolumns(data, 'date')
      plotOptions.series[0].data = getCountrycolumns(data, element)
      var chart = new ApexCharts(document.querySelector(`#${element}_chart`), plotOptions);
      chart.render();
      index += 1 
    });
  }

  function createCountryTable(c, id, col){
    if ($.fn.dataTable.isDataTable(`#${id}`)) {
    var datable = $(`#${id}`).DataTable().clear().destroy();
    }
    const data = c
    const table = document.getElementById(id)
    const t = $(table).find('tbody')
    t.innerHTML = ""
    data.forEach(element => {
      const tr = document.createElement('tr')
      col.forEach(tag => {
          const td = document.createElement('td')
          if(tag != 'date'){
            td.innerHTML = sepNum(element[tag])
          }else{
            td.innerHTML = element[tag]
          }
          tr.appendChild(td)
      });
      t[0].appendChild(tr)
    });
    $(table).DataTable({
      "order": [[ 0, "desc" ]],
       "scrollY": true,
       "scrollX": true,
    })

    $($.fn.dataTable.tables(true)).DataTable()
    .columns.adjust();
  }

  function updateCountrydData(data){
    const lastTotalCase = data[data.length - 1]
    const plot = ['total_cases', 'new_cases', 'total_deaths', 'new_deaths']
    plot.forEach(element => {
      const el = document.getElementById(element)
      el.innerHTML = sepNum(lastTotalCase[element])
    });
  }

  function getCountrycolumns(c, d){
    var data = [];
    c.forEach(element => {
      if(element[d] != undefined){
        data.push(element[d])
      }
    });
    return data
  }

  $('#country').change(function(e){
    getCountryData(e.target.value)
  })

  async function updateUI(){
    await updateCountryList()
    await getCountryData(country)
  }
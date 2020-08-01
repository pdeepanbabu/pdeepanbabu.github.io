var options = {
    series: [{
    data: [1]
  }],
    chart: {
      animations: {
  enabled: false,},
    type: 'area',
    width: '100%',
    height: 90,
    sparkline: {
      enabled: true
    },
  },
  stroke: {
    curve: 'smooth',
    width: 1
  },
   colors:['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800'],
  fill: {
    opacity: 0.3,
  },
  tooltip:{
    enabled: true
  },
  yaxis: {
    min: 0
  },
  title: {
    text: '$424,652',
    offsetX: 0,
    style: {
      fontSize: '20px',
    }
  },
  };

function sepNum(r,e){return e=e||",",r=String(r).replace(/[\u0660-\u0669\u06f0-\u06f9]/g,function(r){return 15&r.charCodeAt(0)}).replace(/(?:[^\.]|^)\b(\d+)/g,function(r){return r=r.replace(/\B(?=(\d{3})+\b)/g,e)})}

const m = document.getElementById('main-covid-data')

  async function fetchAPI(url){
      const resp = await fetch(url)
      const data = await resp.json()
      return data
  }

  async function getData(){
    $body = $("body");
    await $body.addClass("loading");
    
    const countryData = await fetchAPI('https://freegeoip.app/json/')
    const country = countryData['country_name']
    const covidData = await fetchAPI("/projects/covid-19/data/owid-covid-data.json")
    const countriesCode = Object.keys(covidData)
    const conData = getCountryData(countriesCode, covidData, country)
    const id = document.getElementById('current-location')
    id.innerHTML = country
    id.href = '/projects/covid-19/pages/country.html#'+conData['code']
    id.setAttribute('data-id', conData['code'])
    await updateWorldData(covidData)
    await createTable(conData, 'world-table', ['text', 'z', 'deaths', 'weeks','new', 'inc %', 'population', '%', 'continent'])

    await $body.removeClass("loading"); 
  }

function getCountryData(countriesCode, covidData, country){
    let conData = []
    let code;
    countriesCode.forEach(element => {
      let details = {}
      const location = covidData[element]['location']
      if(location.toLowerCase() == country.toLowerCase()){
          code = element
      }
        const d = covidData[element]['data']
        details['weeks'] = d.slice(-21)
        details['location'] = element
        details['z'] = d[d.length - 1]['total_cases']
        details['text'] = covidData[element]['location']
        details['population'] = covidData[element]['population']
        details['continent'] = covidData[element]['continent']
        details['deaths'] = d[d.length - 1]['total_deaths']
        details['new'] = d[d.length - 1]['new_cases']
        details['%'] = ((details['z']/details['population'])*100).toFixed(2) + ' %'
        var diff = d[d.length - 1]['new_cases']-d[d.length - 2]['new_cases']
        var lastnewCase = d[d.length - 2]['new_cases']
        
        if(lastnewCase != 0){
          details['inc %'] = ((diff/lastnewCase)*100).toFixed(2)
          if(details['inc %'] < 0){ details['inc %'] = `<i class="fas fa-sort-down" style="color:green"></i> ${details['inc %']} %`}
          else{details['inc %'] = `<i class="fas fa-sort-up" style="color:red"></i> ${details['inc %']} %`}
        } else {
          details['inc %'] = '-'
        }
        //console.log(diff, lastnewCase, details['inc %'])
        conData.push(details)
    });
    return {'data':conData, 'code':code}
  }

  function createTable(c, id, col){
    var chart;
    const data = c['data']
    const table = document.getElementById(id)
    const t = $(table).find('tbody')
    data.forEach(element => {
      if(element['z'] != undefined && element['text'] != 'World'){
        const tr = document.createElement('tr')
        col.forEach(tag => {
          const td = document.createElement('td')
          if(tag == 'text'){
          const a = document.createElement('a')
          a.href = '/projects/covid-19/pages/country.html#'+element['location']
          a.innerHTML = element[tag]
          a.className = 'text-muted text-decoration-none'
          a.setAttribute('style', 'color: #c51162!important')
          td.appendChild(a)
          } else if (tag == 'weeks'){
            const p = document.createElement('div')
            p.className = 'col'
            p.id = element['location']
            p.setAttribute('style', 'width:100%')
            td.appendChild(p)
            let plotOptions = JSON.parse(JSON.stringify(options))
            plotOptions.title.text = ''
            plotOptions.chart.height = 40
            plotOptions.chart.width = 100
            plotOptions.chart.type = 'line'
            plotOptions.tooltip.enabled = false
            plotOptions.stroke.width = 2
            plotOptions.series[0].name = 'Total Cases'
            plotOptions.colors[0] = '#ff1744'
            plotOptions.series[0].data = getcolumns('new_cases', element['weeks'])
            chart = new ApexCharts(p, plotOptions);
          }
          else {
            td.innerHTML = sepNum(element[tag])
          }
          tr.appendChild(td)
      });
      t[0].appendChild(tr)
      chart.render();
      }
    });
    $(table).DataTable({
      "order": [[ 1, "desc" ]],
      scrollCollapse: true,
       paging:true,
       "scrollX": true,
    })
  }

  function updateWorldData(covidData){
    const worldData = covidData['OWID_WRL']['data']
    const lastTotalCase = worldData[worldData.length - 1]
    
    const plot = ['total_cases', 'new_cases', 'total_deaths', 'new_deaths']
    //const colors = ['#ff1744', '#ff9800', '#482880', '#004d40']
    const colo = ['#2E93fA', '#66DA26', '#546E7A', '#E91E63', '#FF9800']
    let index = 0;
    plot.forEach(element => {
      let plotOptions = JSON.parse(JSON.stringify(options))
      plotOptions.title.text = sepNum(lastTotalCase[element])
      plotOptions.series[0].name = element
      plotOptions.colors[0] = colo[index]
      plotOptions.series[0].data = getcolumns(element, worldData)

      var chart = new ApexCharts(document.querySelector('#'+element), plotOptions);
      chart.render();
      index += 1
    });
  }

  function getcolumns(c, d){
    const data = d.map(function(item, index){return item[c]})
    return data
  }



  
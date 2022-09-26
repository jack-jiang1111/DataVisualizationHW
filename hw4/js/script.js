// ******* DATA LOADING *******
// We took care of that for you
async function loadData () {
  const covidData = await d3.csv('data/owid-covid.csv');
  const mapData = await d3.json('data/world.json');
  return { covidData, mapData };
}


// ******* STATE MANAGEMENT *******
// This should be all you need, but feel free to add to this if you need to 
// communicate across the visualizations
const globalApplicationState = {
  selectedLocations: [],
  covidData: null,
  mapData: null,
  worldMap: null,
  lineChart: null,
};


//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {
  console.log('Here is the imported data:', loadedData.covidData);

  // Store the loaded data into the globalApplicationState
  globalApplicationState.covidData = loadedData.covidData;
  globalApplicationState.mapData = loadedData.mapData;

  // Creates the view objects with the global state passed in 
  const worldMap = new MapVis(globalApplicationState);
  const lineChart = new LineChart(globalApplicationState);

  globalApplicationState.worldMap = worldMap;
    globalApplicationState.lineChart = lineChart;
    document.getElementById("clear-button").onclick = function () { ClearButton(); };
    legend = d3.select('#legend')
        .append('rect')
        .attr('width', 150)
        .attr('y', 475)
        .attr('height', 30)
        .attr('fill', 'url(#color-gradient)');
        
});
function ClearButton() {
    console.log("clear all the selected")
    while (globalApplicationState.selectedLocations.length > 0) {
        globalApplicationState.selectedLocations.pop();
    }
    let locations = ["OWID_OCE", "OWID_AFR", "OWID_ASI", "OWID_EUR", "OWID_NAM", "OWID_SAM"]
    globalApplicationState.lineChart.updateSelectedCountries(locations);

    document.querySelectorAll('#countries > .country.selected').forEach((b) => b.className.baseVal = 'countries country');
}

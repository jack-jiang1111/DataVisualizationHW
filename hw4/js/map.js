/** Class representing the map view. */
class MapVis {
  /**
   * Creates a Map Visuzation
   * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
   */
  constructor(globalApplicationState) {
    this.globalApplicationState = globalApplicationState;

    // Set up the map projection
    const projection = d3.geoWinkel3()
      .scale(150) // This set the size of the map
          .translate([400, 250]); // This moves the map to the center of the SVG
    let geoJSON = topojson.feature(this.globalApplicationState.mapData, this.globalApplicationState.mapData.objects.countries);
    let covidData = this.globalApplicationState.covidData;

    // This converts the projected lat/lon coordinates into an SVG path string
    let path = d3.geoPath().projection(projection);
    // Define a  color map
    let colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 1])
    let dataLookup = {};

    
    let maxCase = 0
    covidData.forEach(function (stateRow) {
        // if the float is too small, then just return 0
        if (isNaN(parseFloat(stateRow.total_cases_per_million))) {
            dataLookup[stateRow.iso_code] = 0.0;
        }
        else {
            if (!dataLookup[stateRow.iso_code] || parseFloat(stateRow.total_cases_per_million) > dataLookup[stateRow.iso_code]){
                dataLookup[stateRow.iso_code] = parseFloat(stateRow.total_cases_per_million);
            }    
        } 
    });
    
    geoJSON.features.forEach(function (feature) {
        feature.properties.value = dataLookup[feature.id];
        if (feature.properties.value>maxCase){
            maxCase = feature.properties.value
        }
    });
    // add legend text
    d3.select('#map')
            .append('text')
            .text('0')
            .attr('x', 0)
            .attr('y', 470);

    d3.select('#map')
    .append('text')
    .text(d3.format(".2s")(maxCase))
    .attr('x', 120)
    .attr('y', 470);
    

    // main path
    d3.select("#countries").selectAll("path")
        .data(geoJSON.features)
        .join("path")
        .attr('class', "countries country")
        .attr("d", path)
        .style("fill", function (d) {
            if (d.properties.value == undefined) {
                return colorScale(0)
            }
            else {
                return colorScale(d.properties.value/maxCase);
            }
        })
        .on('click', (d, data) =>{
            // change selected class
            var country = d.target;
            if (country.className.baseVal == 'countries country'){
                country.className.baseVal = 'countries country selected'
            }
            else{
                country.className.baseVal = 'countries country'
            }
            
            // update array and call linechart method
            this.updateSelectedCountries(data);
            globalApplicationState.lineChart.updateSelectedCountries(globalApplicationState.selectedLocations);
      })

    // TODO: no countries outlines? 
    // outline and geo graticule 
    let graticule = d3.geoGraticule();
    d3.select('#graticules')
        .append('path')
        .datum(graticule)
        .attr('class', "grat")
        .attr('d', path)
        .attr('fill', 'none');
      d3.select('#graticules')
        .append("path")
        .datum(graticule.outline)
        .attr("class", "graticule outline")
        .attr("d", path).attr('fill', 'none');
  }

    updateSelectedCountries(country) {
        if (!globalApplicationState.selectedLocations.includes(country.id)) {
            globalApplicationState.selectedLocations.push(country.id);
            console.log(this.globalApplicationState.selectedLocations)
        }
        else{
            for( var i = 0; i < globalApplicationState.selectedLocations.length; i++){ 
                if ( globalApplicationState.selectedLocations[i] === country.id) { 
                    globalApplicationState.selectedLocations.splice(i, 1); 
                }
            }
        }  
    }
}

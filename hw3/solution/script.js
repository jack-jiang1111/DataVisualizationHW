
setup();
// Constants for the charts, that would be useful.
const CHART_WIDTH = 500;
const CHART_HEIGHT = 250;
const MARGIN = { left: 50, bottom: 20, top: 20, right: 20 };
const ANIMATION_DURATION = 300;

/**
 * Initial setup for the page. This should only be called once. 
 */
function setup () {

  // query selectors
  document.querySelector('#dataset').addEventListener('change', changeData);
  document.querySelector('#random').addEventListener('change', changeData);
  document.querySelector('#metric').addEventListener('change', changeData);

  // Fill in some d3 setting up here if you need
  // for example, svg for each chart, g for axis and shapes
  d3.select('#Barchart-div')
    .append('svg')
    .attr('id', 'Barchart-svg')
    .append('g')
    .attr('id', 'Barchart-x-axis');
  d3.select('#Barchart-svg')
    .append('g')
    .attr('id', 'Barchart-y-axis');
  d3.select('#Barchart-svg')
    .append('g')
    .attr('id', 'BarChart')
    .attr('class', 'bar-chart');

  d3.select('#Linechart-div')
    .append('svg')
    .attr('id', 'Linechart-svg')
    .append('g')
    .attr('id', 'Linechart-x-axis');
  d3.select('#Linechart-svg')
    .append('g')
    .attr('id', 'Linechart-y-axis');
  d3.select('#Linechart-svg')
    .append('g')
    .attr('id', 'LineChart')
    .attr('class', 'line-chart')
    .append('path');

  d3.select('#Areachart-div')
    .append('svg')
    .attr('id', 'Areachart-svg')
    .append('g')
    .attr('id', 'Areachart-x-axis');
  d3.select('#Areachart-svg')
    .append('g')
    .attr('id', 'Areachart-y-axis');
  d3.select('#Areachart-svg')
    .append('g')
    .attr('id', 'AreaChart')
    .attr('class', 'area-chart')
    .append('path');


  d3.select('#Scatterplot-div')
    .append('svg')
    .attr('id', 'Scatterplot-svg')
    .append('g')
    .attr('id', 'Scatterplot-x-axis');
  d3.select('#Scatterplot-svg')
    .append('g')
    .attr('id', 'Scatterplot-y-axis');
  d3.select('#Scatterplot-svg')
    .append('g')
    .attr('id', 'ScatterPlot')
    .attr('class', 'scatter-plot');

  changeData();
}



/**
 * Render the visualizations
 * @param data
 */
function update (data) {

  const metric = d3.select('#metric').property('value');

  //Set up bar chart scale and axis
  const heightScale = d3.scaleLinear()
    .domain([0, d3.max(data.map(d => d[metric]))])
    .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
    .nice();

  const barchartBandScale = d3.scaleBand()
    .domain(data.map(d => d.date))
    .range([MARGIN.left, CHART_WIDTH])
    .padding(0.2);

  d3.select('#Barchart-x-axis')
    .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(barchartBandScale))
    .selectAll('path')
    .remove();

  d3.select('#Barchart-y-axis')
    .call(d3.axisLeft(heightScale))
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  //Set up line chart and area chart axis and horizontal scale for them.
  //We can reuse the height scale
  //However we need to use scalePoint because scaleBand will return the left edge of the band,
  //but scalePoint will return the center.

  const horizontalScale = d3.scalePoint()
    .domain(data.map(d => d.date))
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right]);

  d3.select('#Linechart-x-axis')
    .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(horizontalScale));

  d3.select('#Linechart-y-axis')
    .call(d3.axisLeft(heightScale))
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  d3.select('#Areachart-x-axis')
    .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(horizontalScale));

  d3.select('#Areachart-y-axis')
    .call(d3.axisLeft(heightScale))
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  updateBarChart(data, barchartBandScale, heightScale, metric);


  const lineGenerator = d3.line()
    .x(d => horizontalScale(d.date))
    .y(d => heightScale(d[metric]) + MARGIN.top);

  updateLineChart(data, lineGenerator, horizontalScale);

  const areaGenerator = d3.area()
    .x(d => horizontalScale(d.date))
    .y1(d => heightScale(d[metric]) + MARGIN.top)
    .y0(CHART_HEIGHT - MARGIN.bottom);

  updateAreaChart(data, areaGenerator, horizontalScale);

  //Set up scatter plot x and y axis. 
  //Since we are mapping death and case, we need new scales instead of the ones above. 
  //Cases would be the horizontal axis, so we need to use width related constants.
  //Deaths would be vertical axis, so that would need to use height related constants.

  const scatterCaseScale = d3.scaleLinear()
    .domain([0, d3.max(data.map(d => parseInt(d.cases)))])
    .range([MARGIN.left, CHART_WIDTH - MARGIN.right])
    .nice();

  const scatterDeathScale = d3.scaleLinear()
    .domain([0, d3.max(data.map(d => parseInt(d.deaths)))])
    .range([CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0])
    .nice();

  d3.select('#Scatterplot-x-axis')
    .attr('transform', `translate(0,${CHART_HEIGHT - MARGIN.bottom})`)
    .call(d3.axisBottom(scatterCaseScale));
  d3.select('#Scatterplot-y-axis')
    .call(d3.axisLeft(scatterDeathScale))
    .attr('transform', `translate(${MARGIN.left}, ${MARGIN.top})`);

  updateScatterPlot(data, scatterCaseScale, scatterDeathScale);

}

/**
 * 
 * @param {*} data 
 * @param {*} bandScale 
 * @param {*} heightScale 
 */

function updateBarChart (data, bandScale, heightScale, metric) {

  d3.select('#BarChart')
    .selectAll('rect')
    .data(data, d => d.date)
    .join(
      enter => enter
        .append('rect')
        .attr('width', bandScale.bandwidth())
        .attr('x', d => bandScale(d.date))
        .attr('y', d => heightScale(d[metric]) + MARGIN.top)
        .attr('height', d => heightScale(0) - heightScale(d[metric]))
        .attr('opacity', 0)
        .transition()
        .duration(ANIMATION_DURATION)
        .delay(ANIMATION_DURATION)
        .attr('height', d => heightScale(0) - heightScale(d[metric]))
        .attr('opacity', 1),

      update => update
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('x', d => bandScale(d.date))
        .attr('y', d => heightScale(d[metric]) + MARGIN.top)
        .attr('width', bandScale.bandwidth())
        .attr('height', d => heightScale(0) - heightScale(d[metric])),

      exit => exit
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('width', 0)
        .attr('height', 0)
        .remove()
    )
    .on('mouseover', (e) => d3.select(e.target).classed('hovered', true))
    .on('mouseout', (e) => d3.select(e.target).classed('hovered', false));
}

/**
 * Update the line chart
 * @param {{cases:number, date:string, deaths:number}[]} data 
 * @param {LineGenerator} lineGenerator a d3 line generator, that takes in the data array, 
 *                                      and output the string for the 'd' attribute of the path.
 * 
 */
function updateLineChart (data, lineGenerator, horizontalScale) {

  const lineChart = d3.select('#LineChart')
    .select('path')
    .datum(data)
    .attr('d', lineGenerator);
  const pathLength = lineChart.node().getTotalLength();
  lineChart.attr('stroke-dashoffset', pathLength)
    .attr('stroke-dasharray', pathLength)
    .transition()
    .duration(ANIMATION_DURATION)
    .attr('stroke-dashoffset', 0);
}

/**
 * Update the area chart 
 * @param {{cases:number, date:string, deaths:number}[]} data 
 * @param {LineGenerator} lineGenerator a d3 area generator, that takes in the data array, 
 *                                      and output the string for the 'd' attribute of the path.
 * 
 */
function updateAreaChart (data, areaGenerator, horizontalScale) {

  const areaChart = d3.select('#AreaChart')
    .select('path');
  const prevData = areaChart.datum();
  areaChart.datum(data);

  //a different transition when the data length are not the same
  // make the area "grow" from the bottom
  if ((prevData && prevData.length !== data.length) || !prevData) {
    areaChart.attr('d', d3.area().x(d => horizontalScale(d.date)).y(CHART_HEIGHT - MARGIN.bottom));
  }
  areaChart.transition()
    .duration(ANIMATION_DURATION)
    .attr('d', areaGenerator);

}

//Another way of attaching event listener
function addMouseHoverEvent (b) {
  b.addEventListener('mouseover', (d) => {
    b.className.baseVal = 'hovered';
  });
  b.addEventListener('mouseout', (d) => {
    b.className.baseVal = b.className.baseVal.replace('hovered', '');
  });
}

/**
 * 
 * @param {{cases:number, date:string, deaths:number}[]} data 
 * @param {*} scatterCaseScale 
 * @param {*} scatterDeathScale 
 */

function updateScatterPlot (data, scatterCaseScale, scatterDeathScale) {

  d3.select('#ScatterPlot')
    .selectAll('circle')
    .data(data, d => d.date)
    .join(
      enter => enter
        .append('circle')
        .attr('cx', (d) => scatterCaseScale(d.cases))
        .attr('cy', (d) => scatterDeathScale(d.deaths))
        .attr('transform', `translate(0,${MARGIN.top})`)
        .attr('r', 0)
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('r', 7)
        .transition()
        .delay(ANIMATION_DURATION)
        .duration(ANIMATION_DURATION)
        .attr('r', 5),

      update => update
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('transform', `translate(0,${MARGIN.top})`)
        .attr('cx', (d) => scatterCaseScale(d.cases))
        .attr('cy', (d) => scatterDeathScale(d.deaths)),

      exit => exit
        .transition()
        .duration(ANIMATION_DURATION)
        .attr('r', 7)
        .transition()
        .delay(ANIMATION_DURATION)
        .duration(ANIMATION_DURATION)
        .attr('r', 0)
        .remove()
    )
    .on('click', (e, d) => { console.log(`Cases:${d.cases}, Deaths: ${d.deaths}`); })
    .append('title')
    .text((d) => {
      return `Cases: ${d.cases}, Deaths: ${d.deaths}`;
    });

  document.querySelectorAll('#ScatterPlot > circle').forEach((b) => addMouseHoverEvent(b));
}

/**
 * Update the data according to document settings
 */
function changeData () {
  //  Load the file indicated by the select menu
  const dataFile = d3.select('#dataset').property('value');

  d3.csv(`data/${dataFile}.csv`)
    .then(dataOutput => {

      /**
       * D3 loads all CSV data as strings. While Javascript is pretty smart
       * about interpreting strings as numbers when you do things like
       * multiplication, it will still treat them as strings where it makes
       * sense (e.g. adding strings will concatenate them, not add the values
       * together, or comparing strings will do string comparison, not numeric
       * comparison).
       *
       * We need to explicitly convert values to numbers so that comparisons work
       * when we call d3.max()
       **/

      const dataResult = dataOutput.map((d) => ({
        cases: parseInt(d.cases),
        deaths: parseInt(d.deaths),
        date: d3.timeFormat("%m/%d")(d3.timeParse("%d-%b")(d.date))
      }));
      if (document.getElementById('random').checked) {
        // if random subset is selected
        update(randomSubset(dataResult));
      } else {
        update(dataResult);
      }
    }).catch(e => {
      console.log(e);
      alert('Error!');
    });
}

/**
 *  Slice out a random chunk of the provided in data
 *  @param data
 */
function randomSubset (data) {
  return data.filter((d) => Math.random() > 0.5);
}

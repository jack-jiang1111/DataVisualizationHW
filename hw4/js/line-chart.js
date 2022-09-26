/** Class representing the line chart view. */
class LineChart {
    /**
    * Creates a LineChart
    * @param globalApplicationState The shared global application state (has the data and map instance in it)
    */
    constructor(globalApplicationState) {
        // Set some class level variables
        let locations = ["OWID_OCE", "OWID_AFR", "OWID_ASI", "OWID_EUR", "OWID_NAM", "OWID_SAM"]
        this.updateLineChart(locations)
    }
    updateLineChart(locations) {
        this.globalApplicationState = globalApplicationState;
        let lineChart = d3.select('#line-chart')
        let covidData = this.globalApplicationState.covidData;
        let dataLookup = [];
        let format = d3.timeParse("%Y-%m-%d");

        covidData.forEach(function (stateRow) {
            if (locations.includes(stateRow.iso_code)) {
                if (isNaN(parseFloat(stateRow.total_cases_per_million))) {
                    stateRow.total_cases_per_million = 0.0;
                }
                else {
                    stateRow.total_cases_per_million = parseFloat(stateRow.total_cases_per_million);
                }
                stateRow.date = format(stateRow.date)
                dataLookup.push(stateRow)
            }
        });

        let groupedLocationData = d3.group(dataLookup, (d1) => d1.iso_code)
        let padding = { left: 80, bottom: 150, right: 50 }
        let lineColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(groupedLocationData.keys());
        // Add x axis --> it is a date format

        const xAxis = d3.scaleTime()
            .domain(d3.extent(dataLookup.map((row) => row.date)))
            .range([padding.left, 700 - padding.right]);

        lineChart
            .select('#x-axis')
            .attr('transform', `translate(0, ${600 - padding.bottom})`)
            .call(d3.axisBottom(xAxis).tickFormat(d3.timeFormat("%b %Y")))

        lineChart
            .append('text')
            .text('Date')
            .attr('x', 350)
            .attr('y', 500);

        const yAxis = d3.scaleLinear()
            .domain([0, Math.max(...dataLookup.map((row) => row.total_cases_per_million))])
            .range([600 - padding.bottom, 10])
            .nice();

        lineChart.select('#y-axis')
            .attr('transform', `translate(${padding.left},0)`)
            .call(d3.axisLeft(yAxis));

        // Append y axis text
        lineChart
            .append('text')
            .text('Case per million')
            .attr('x', -250)
            .attr('y', 25)
            .attr('transform', 'rotate(-90)');
        lineChart
            .select('#lines')
            .selectAll('path')
            .data(groupedLocationData)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', ([group, values]) => lineColorScale(values[0].location))
            .attr('stroke-width', 1)
            .attr('d', ([group, values]) => d3.line()
                .x((d) => xAxis(d.date))
                .y((d) => yAxis(d.total_cases_per_million))
                (values))

        // interative section
        lineChart.on('mousemove', (event) => {
            if (event.clientX - 800 > padding.left && event.clientX - 800 < 700 - padding.right) {
                // Set the line position
                lineChart
                    .select('#overlay')
                    .select('line')
                    .attr('stroke', 'black')
                    .attr('x1', event.clientX - 800)
                    .attr('x2', event.clientX - 800)
                    .attr('y1', 600 - padding.bottom)
                    .attr('y2', 0);

                //// round date data 
                const dateHovered = xAxis.invert(event.clientX - 800)
                dateHovered.setTime(dateHovered.getTime() + (12 * 60 * 60 * 1000));
                dateHovered.setHours(0, 0, 0, 0);

                // sort data
                const filteredData = dataLookup
                    .filter((row) => +row.date === +dateHovered)
                    .sort((rowA, rowB) => rowB.total_cases_per_million - rowA.total_cases_per_million)
                // flag to switch side
                let condition = event.clientX > 1290

                // draw text labels
                lineChart.select('#overlay')
                    .selectAll('text')
                    .data(filteredData)
                    .join('text')
                    //.text(d => d.total_cases_per_million > 1000 ? `${d.location}, ${Math.round(d.total_cases_per_million / 1000)}k` : `${d.location}, ${Math.round(d.total_cases_per_million)}`)
                    .text(d => `${d.location}, ${d3.format(".2s")(d.total_cases_per_million)}`)
                    .attr('x', condition ? event.clientX - 950 : event.clientX - 780)
                    .attr('y', (d, i) => 20 * i + 20)
                    .attr('alignment-baseline', 'hanging')
                    .attr('fill', (d) => lineColorScale(d.location));
            }

        });
    }
    updateSelectedCountries(locations) {
        this.updateLineChart(locations)
    }
    
}

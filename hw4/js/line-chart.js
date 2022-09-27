/** Class representing the line chart view. */
class LineChart {
    /**
    * Creates a LineChart
    * @param globalApplicationState The shared global application state (has the data and map instance in it)
    */
    constructor(globalApplicationState) {
        // Set some class level variables
        let locations = ["OWID_OCE", "OWID_AFR", "OWID_ASI", "OWID_EUR", "OWID_NAM", "OWID_SAM"]
        this.lineChart = d3.select('#line-chart')
        this.padding = { left: 80, bottom: 150, right: 50 }
        
        // x axis text
        this.lineChart
            .append('text')
            .text('Date')
            .attr('x', 350)
            .attr('y', 500);

        // Append y axis text
        this.lineChart
            .append('text')
            .text('Case per million')
            .attr('x', -250)
            .attr('y', 25)
            .attr('transform', 'rotate(-90)');

        this.click = false
        this.lineChart.on('click', (d, data) =>{
            this.click = true
        })

        this.updateLineChart(locations);
    }
    updateLineChart(locations) {
        this.lineChart = d3.select('#line-chart')
        let covidData = globalApplicationState.covidData;
        let dataLookup = [];
        let format = d3.timeParse("%Y-%m-%d");

        // data preprocessing
        covidData.forEach(function (stateRow) {
            // make a copt so we don't change the orginal covid data
            let copiedRow = JSON.parse(JSON.stringify(stateRow));
            if (locations.includes(copiedRow.iso_code)) {
                if (isNaN(parseFloat(copiedRow.total_cases_per_million))) {
                    copiedRow.total_cases_per_million = 0.0;
                }
                else {
                    copiedRow.total_cases_per_million = parseFloat(copiedRow.total_cases_per_million);
                }
                copiedRow.date = format(copiedRow.date)
                dataLookup.push(copiedRow)
            }
        });

        let groupedLocationData = d3.group(dataLookup, d => d.iso_code)
        this.lineColorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(groupedLocationData.keys());

        // Add x axis --> it is a date format
        const xAxis = d3.scaleTime()
            .domain(d3.extent(dataLookup.map((row) => row.date)))
            .range([this.padding.left, 700 - this.padding.right])
            .nice();

        this.lineChart
            .select('#x-axis')
            .attr('transform', `translate(0, ${600 - this.padding.bottom})`)
            .call(d3.axisBottom(xAxis).tickFormat(d3.timeFormat("%b %Y")))

        // y axis, linear float number
        const yAxis = d3.scaleLinear()
            .domain([0, Math.max(...dataLookup.map((row) => row.total_cases_per_million))])
            .range([600 - this.padding.bottom, 10])
            .nice();

        this.lineChart.select('#y-axis')
            .attr('transform', `translate(${this.padding.left},0)`)
            .call(d3.axisLeft(yAxis));


        this.lineChart
            .select('#lines')
            .selectAll('path')
            .data(groupedLocationData)
            .join('path')
            .attr('fill', 'none')
            .attr('stroke', ([group, values]) => this.lineColorScale(values[0].location))
            .attr('stroke-width', 1)
            .attr('d', ([group, values]) => d3.line()
                .x((d) => xAxis(d.date))
                .y((d) => yAxis(d.total_cases_per_million))
                (values))
            
        // interative section
        this.lineChart.on('mousemove', (event) => {
            if (event.offsetX > this.padding.left && event.offsetX < 700 - this.padding.right && this.click) {
                // Set the line position
                
                this.lineChart
                    .select('#overlay')
                    .select('line')
                    .attr('stroke', 'black')
                    .attr('x1', event.offsetX)
                    .attr('x2', event.offsetX)
                    .attr('y1', 600 - this.padding.bottom)
                    .attr('y2', 0);

                //// round date data 
                const dateHovered = xAxis.invert(event.offsetX)
                dateHovered.setTime(dateHovered.getTime() + (12 * 60 * 60 * 1000));
                dateHovered.setHours(0, 0, 0, 0);

                // sort data
                const filteredData = dataLookup
                    .filter((row) => +row.date === +dateHovered)
                    .sort((rowA, rowB) => rowB.total_cases_per_million - rowA.total_cases_per_million)

                // flag to switch side
                let condition = event.offsetX > 500 - this.padding.right

                // draw text labels
                this.lineChart.select('#overlay')
                    .selectAll('text')
                    .data(filteredData)
                    .join('text')
                    //.text(d => d.total_cases_per_million > 1000 ? `${d.location}, ${Math.round(d.total_cases_per_million / 1000)}k` : `${d.location}, ${Math.round(d.total_cases_per_million)}`)
                    .text(d => `${d.location}, ${d3.format(".2s")(d.total_cases_per_million)}`)
                    .attr('x', condition ? event.offsetX-150 : event.offsetX+20)
                    .attr('y', (d, i) => 20 * i + 20)
                    .attr('alignment-baseline', 'hanging')
                    .attr('fill', (d) => this.lineColorScale(d.location));
            }

        });
    }
    updateSelectedCountries(locations) {
        
        this.updateLineChart(locations);
    }
    
}

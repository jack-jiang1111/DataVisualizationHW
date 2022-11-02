/** Class implementing the table. */

let colorMap = {
    "economy/fiscal issues": "#84bca8",
    "energy/environment": "#e2916c",
    "crime/justice": "#928cc5",
    "education": "#d487ba",
    "health care": "#b1d469",
    "mental health/substance abuse": "#edd755"
}

class Table {
    /**
     * Creates a Table Object
     */
    constructor(data) {
        this.tableData = data;
        this.vizWidth = 300;
        this.vizHeight = 20;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'Phrase'
            },
            {
                sorted: false,
                ascending: false,
                key: 'Frequency',
            },
            {
                sorted: false,
                ascending: false,
                key: 'Percentages',
            },
            {
                sorted: false,
                ascending: false,
                key: 'total',
            },
        ]

        this.drawTable()
        this.drawLegend()
        this.attachSortHandlers() 
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */
        let leftfrequency = 50
        let widths = 300;
        let legend = d3.select("#FrequencyAxis")

        let textData = ["0.0","0.5","1.0"]
        legend.selectAll("text")
            .data(textData)
            .join("text")
            .attr("x", (d, i) => {
                //console.log(d, i)
                return widths/3*i + leftfrequency;
            })
            .attr("y", 25)
            .text((d) => d)
        legend.selectAll("line")
            .data(textData)
            .join("line")
            .attr("x1", (d, i) => widths / 3 * i + leftfrequency)
            .attr("y1", 35)
            .attr("x2", (d, i) => widths / 3 * i + leftfrequency)
            .attr("y2", 100)
            .style("stroke", "black")
            .style("stroke-width", 3)

        let legendPercent = d3.select("#PercentagesAxis")
        let percentData = ["100","50","0","50","100"]
        legendPercent.selectAll("text")
            .data(percentData)
            .join("text")
            .attr("x", (d, i) => {
                return widths / 5 * i + leftfrequency-20;
            })
            .attr("y", 25)
            .text((d) => d)
        legendPercent.selectAll("line")
            .data(percentData)
            .join("line")
            .attr("x1", (d, i) => widths / 5 * i + leftfrequency-20)
            .attr("y1", 35)
            .attr("x2", (d, i) => widths / 5 * i + leftfrequency-20)
            .attr("y2", 100)
            .style("stroke", "black")
            .style("stroke-width", 3)
    }  
    drawTable() {
        this.vizHeight = 25
        this.vizWidth = 300
        let rowSelection = d3.select('#NgramTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr')

        let tdSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td') 
            .text((d, i) => { if (d.type == "text") { return d.value; } });

        let visSelection = tdSelection.filter(d=>d.type==='bar')
        let svgSelect = visSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', this.vizHeight);
        let groupSelection = svgSelect.selectAll('g')
            .data(d => [d])
            .join('g')
       
        this.addRectangles(groupSelection);
    }
    rowToCellDataTransform(d) {
        let speechInfo = {
            type: 'bar',
            d_speech: d.percent_of_d_speeches,
            r_speech: d.percent_of_r_speeches,
            bartype: 'speech'
        };
        let phrase = {
            type: 'text',
            value: d.phrase
        }
        let frequency = {
            type: 'bar',
            value: d.total / 50,
            category: d.category,
            bartype: 'frequency'
        }
        let total = {
            type: 'text',
            value: d.total
        }
        let dataList = [phrase, frequency,speechInfo, total];
        return dataList;
    } 
    addRectangles(containerSelect) {
        let height = 25;
        let frequency = containerSelect.filter((d, i) => d.bartype=='frequency') // frequency selection data
        let percentage = containerSelect.filter((d, i) => d.bartype=='speech')// percentage selection data

        frequency.append("rect")
            .join("rect")
            .attr("x", 50)
            .attr("y", 5)
            .attr("width", (d, i) => {
                //console.log(d.value)
                // width range 0-200
                // frequency range: 0-1
                return d.value*200
                }
            )
            .attr("height", height)
            //.style("opacity", opacity)
            .style("fill", d => colorMap[d.category])

        // right part repulica
        percentage.append("rect")
            .join("rect")
            .attr("x", 150+2)
            .attr("y", 5)
            .attr("width", (d, i) => {
                //console.log(d.r_speech);
                // width range: 0-120
                return  d.r_speech/100*120;
            })
            .attr("height", height)
            .attr("fill", "firebrick")

        // left side democra
        percentage.append("rect")
            .join("rect")
            .attr("x", (d)=> 30+d.d_speech/100*120)
            .attr("y", 5)
            .attr("width", (d, i) => {
                //  range: 30-150
                //console.log(d.d_speech);
                return Math.max(120-d.d_speech/100*120-2,0);
            })
            .attr("height", height)
            .attr("fill", "steelblue")
    }

    attachSortHandlers() 
    {
        d3.select("#columnHeaders").on('click',(d,data)=>{
            let phrase = this.headerData.find(e=>e.key==="Phrase")
            let frequency = this.headerData.find(e => e.key ==="Frequency")
            let percent = this.headerData.find(e => e.key === "Percentages")
            let total = this.headerData.find(e => e.key === "total")
            //Phrase Frequency Percentages Total
            if (d.target.textContent == "Phrase") {

                if (!phrase.sorted) {
                    this.tableData.sort((a, b) => (a.phrase > b.phrase) ? 1 : -1)
                    phrase.ascending = true
                    phrase.sorted = true
                    frequency.sorted = false
                    frequency.ascending = false
                    percent.sorted = false
                    percent.ascending = false
                    total.sorted = false
                    total.ascending = false
                }
                else {
                    if (phrase.ascending) {
                        this.tableData.sort((a, b) => (a.phrase > b.phrase) ? -1 : 1)
                        phrase.ascending = false
                    }
                    else {
                        this.tableData.sort((a, b) => (a.phrase > b.phrase) ? 1 : -1)
                        phrase.ascending = true
                    }
                }
            }
            else if (d.target.textContent == "Frequency") {

                if (!frequency.sorted) {
                    this.tableData.sort((a, b) => (parseFloat(a.total) > parseFloat(b.total) ? 1 : -1))
                    frequency.ascending = true
                    frequency.sorted = true
                    phrase.sorted = false
                    phrase.ascending = false
                    percent.sorted = false
                    percent.ascending = false
                    total.sorted = false
                    total.ascending = false
                }
                else {
                    if (frequency.ascending) {
                        this.tableData.sort((a, b) => (parseFloat(a.total) > parseFloat(b.total) ? 1 : -1))
                        frequency.ascending = false
                    }
                    else {
                        this.tableData.sort((a, b) => (parseFloat(a.total) < parseFloat(b.total) ? 1 : -1))
                        frequency.ascending = true
                    }
                }

            }
            else if (d.target.textContent == "Percentages") {

                if (!percent.sorted) {
                    this.tableData.sort((a, b) => (parseFloat(a.percent_of_d_speeches)+parseFloat(a.percent_of_r_speeches) > parseFloat(b.percent_of_d_speeches)+parseFloat(b.percent_of_r_speeches)) ? -1 : 1)
                    percent.ascending = true
                    percent.sorted = true
                    frequency.ascending = false
                    frequency.sorted = false
                    phrase.sorted = false
                    phrase.ascending = false
                }
                else {
                    if (percent.ascending) {
                        this.tableData.sort((a, b) => (parseFloat(a.percent_of_d_speeches)+ parseFloat(a.percent_of_r_speeches) > parseFloat(b.percent_of_d_speeches)+ parseFloat(b.percent_of_r_speeches)) ? -1 : 1)
                        percent.ascending = false
                    }
                    else {
                        this.tableData.sort((a, b) => (parseFloat(a.percent_of_d_speeches)+parseFloat(a.percent_of_r_speeches) < parseFloat(b.percent_of_d_speeches)+ parseFloat(b.percent_of_r_speeches)) ? -1 : 1)
                        percent.ascending = true
                    }
                }
            }
            else if (d.target.textContent == "Total") {

                if (!total.sorted) {
                    this.tableData.sort((a, b) => (parseInt(a.total) > parseInt(b.total)) ? 1 : -1)
                    phrase.ascending = false
                    phrase.sorted = false
                    frequency.sorted = false
                    frequency.ascending = false
                    percent.sorted = false
                    percent.ascending = false
                    total.sorted = true
                    total.ascending = true
                }
                else {
                    if (total.ascending) {
                        this.tableData.sort((a, b) => (parseInt(a.total) > parseInt(b.total)) ? -1 : 1)
                        total.ascending = false
                    }
                    else {
                        this.tableData.sort((a, b) => (parseInt(a.total) > parseInt(b.total)) ? 1 : -1)
                        total.ascending = true
                    }
                }
            }
            else {
                console.log(d.target.textContent)
            }
            this.drawTable();
        })



        
    }

}
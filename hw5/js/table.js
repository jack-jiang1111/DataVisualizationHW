/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(forecastData, pollData) {
        this.forecastData = forecastData;
        this.tableData = [...forecastData];
        // add useful attributes
        for (let forecast of this.tableData)
        {
            forecast.isForecast = true;
            forecast.isExpanded = false;
        }
        this.pollData = pollData;
        this.headerData = [
            {
                sorted: false,
                ascending: false,
                key: 'state'
            },
            {
                sorted: false,
                ascending: false,
                key: 'mean_netpartymargin',
                alterFunc: d => Math.abs(+d)
            },
            {
                sorted: false,
                ascending: false,
                key: 'winner_Rparty',
                alterFunc: d => +d
            },
        ]

        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);

        // Setup data strutures for the following methods
        this.formatData = []
        this.tableData.forEach(element => { this.formatData.push(this.rowToCellDataTransform(element)) })

        this.attachSortHandlers();
        this.drawLegend();
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */
        let widths = 300;
        let heights = 25;
        let legend = d3.select("#marginAxis")
            .attr("width", widths)
            .attr("height", heights);
        let textData = ["+75","+50","+25","","+25","+50","+75"]
        let gap = 40;
        legend.selectAll("text").append("text")
            .data(textData)
            .join("text")
            .attr("x", (d, i) => {
                return widths/2-3*gap+i*gap-15;
            })
            .attr("y", 15)
            .text((d)=>d)
            .style("fill",((d,i)=>{
                if(i<3){return "steelblue"}
                else {return "firebrick"}
            }));

        // this draw the solid line
        legend.append("line") 
            .attr("class","grid-lines-center")
            .attr("x1",widths/2)
            .attr("y1", 0)
            .attr("x2", widths/2)
            .attr("y2", 100)
    }
    
    drawTable() {
        this.updateHeaders();
        let rowSelection = d3.select('#predictionTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr');

        rowSelection.on('click', (event, d) => 
            {
                if (d.isForecast)
                {
                    this.toggleRow(d, this.tableData.indexOf(d));
                }
            });

        let forecastSelection = rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td') 
            .attr('class', d => d.class)
            .text((d, i) => { if (d.type =="text") { return d.value; } });


         
        ////////////
        // PART 1 // 
        ////////////
        /**
         * with the forecastSelection you need to set the text based on the dat value as long as the type is 'text'
         */


        let vizSelection = forecastSelection.filter(d => d.type === 'viz');

        let svgSelect = vizSelection.selectAll('svg')
            .data(d => [d])
            .join('svg')
            .attr('width', this.vizWidth)
            .attr('height', d => d.isForecast ? this.vizHeight : this.smallVizHeight);

        let grouperSelect = svgSelect.selectAll('g')
            .data(d => [d, d, d])
            .join('g');

        this.addGridlines(grouperSelect.filter((d,i) => i === 0), [-75, -50, -25, 0, 25, 50, 75]);
        this.addRectangles(grouperSelect.filter((d,i) => i === 1));
        this.addCircles(grouperSelect.filter((d,i) => i === 2));
    }

    rowToCellDataTransform(d) {
        let stateInfo = {
            type: 'text',
            class: d.isForecast ? 'state-name' : 'poll-name',
            value: d.isForecast ? d.state : d.name
        };

        let marginInfo = {
            type: 'viz',
            value: {
                marginLow: -d.p90_netpartymargin,
                margin: d.isForecast ? -(+d.mean_netpartymargin) : d.margin,
                marginHigh: -d.p10_netpartymargin,
            }
        };

        let winChance;
        if (d.isForecast)
        {
            const trumpWinChance = +d.winner_Rparty;
            const bidenWinChance = +d.winner_Dparty;

            const trumpWin = trumpWinChance > bidenWinChance;
            const winOddsValue = 100 * Math.max(trumpWinChance, bidenWinChance);
            let winOddsMessage = `${Math.floor(winOddsValue)} of 100`
            if (winOddsValue > 99.5 && winOddsValue !== 100)
            {
                winOddsMessage = '> ' + winOddsMessage
            }
            winChance = {
                type: 'text',
                class: trumpWin ? 'trump' : 'biden',
                value: winOddsMessage
            }
        }
        else
        {
            winChance = {type: 'text', class: '', value: ''}
        }

        let dataList = [stateInfo, marginInfo, winChance];
        for (let point of dataList)
        {
            point.isForecast = d.isForecast;
        }
        return dataList;
    }

    updateHeaders() {
        ////////////
        // PART 7 // 
        ////////////
        /**
         * update the column headers based on the sort state
         */

     
    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */
        let gap = 40;
        let widths = 300;
         containerSelect.append("line") 
         .data(ticks) 
         .join("line")
         .attr("class",function(d,i){
            if(i!=3){return "grid-lines"}
            else{return "grid-lines-center"}}
            )
         .attr("x1",(d,i)=>{return widths/2-3*gap+i*gap})
         .attr("y1", 0)
         .attr("x2", (d,i)=>{return widths/2-3*gap+i*gap})
         .attr("y2", 100)
         
        

    }
    transformCoordinate(x) {
        let width = 300;
        //console.log((x / 75 + 1) / 2 * width);
        return (x / 75 + 1) / 2 * width;
    }
    addRectangles(containerSelect) {

        let height = 25;
        // left bars
        containerSelect.append("rect")
            //.data(this.formatData)
            .join("rect")
            .attr("class", function (d) {

                if (d.value.marginLow < 0) {
                    return "biden"
                }
                else {
                    return "none"
                }
            })
            .attr("x", d => this.transformCoordinate(d.value.marginLow))
            .attr("y", this.vizHeight/2-height/2)
            .attr("width", (d, i) => {
                if (d.value.marginLow < 0) {
                    if (d.value.marginHigh > 0) {
                        // if cross the center, just stop at the center
                        return this.vizWidth / 2 - this.transformCoordinate(d.value.marginLow);
                    }
                    else {
                        return this.transformCoordinate(d.value.marginHigh - d.value.marginLow);
                    }
                }
            })
            .attr("height", height)
        
        // right bars
        //containerSelect.append("rectangle")
        //    .data(this.formatData)
        //    .join("rectangle")
        //    .attr("class", "biden")
        //    .attr("x", 0)
        //    .attr("y", 0)
        //    .attr("width", (d, i) => {
        //        //if (d.type != "iz") {
        //        console.log(d[1].value);
        //        return d[1].value.margin;
        //        //}
        //    })
        //    .attr("height", 50)
       
    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */

      
    }

    attachSortHandlers() 
    {
        ////////////
        // PART 6 // 
        ////////////
        /**
         * Attach click handlers to all the th elements inside the columnHeaders row.
         * The handler should sort based on that column and alternate between ascending/descending.
         */

        
    }

  


    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */
     
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}

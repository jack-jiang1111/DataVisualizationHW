/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(data) {
        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;

        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);


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
        let gap = 37.5;
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
        this.addRectangles((grouperSelect.filter((d,i) =>i = 1)).filter((d,i)=>d.isForecast));
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
        
        let state = this.headerData.find(e=>e.key==="state")
        let margin = this.headerData.find(e=>e.key==="mean_netpartymargin")
        let win = this.headerData.find(e=>e.key==="winner_Rparty")

        let header = d3.selectAll(".sortable")._groups[0]

        let stateElement = header[0];
        let marginElement = header[1];
        let winElement = header[2];
        
        if(state.sorted){
            stateElement.classList.add("sorting");
            
            marginElement.classList.remove("sorting");
            winElement.classList.remove("sorting")
            if(state.ascending){
                stateElement.querySelector("i").className = "fas fa-sort-up"
            }
            else{
                stateElement.querySelector("i").className = "fas fa-sort-down"
            }
            marginElement.querySelector("i").className = "fas no-display"
            winElement.querySelector("i").className = "fas no-display"
        }
        else if(margin.sorted){
            marginElement.classList.add("sorting");
            stateElement.classList.remove("sorting");
            winElement.classList.remove("sorting")
            if(margin.ascending){
                marginElement.querySelector("i").className = "fas fa-sort-up"
            }
            else{
                marginElement.querySelector("i").className = "fas fa-sort-down"
            }
            stateElement.querySelector("i").className = "fas no-display"
            winElement.querySelector("i").className = "fas no-display"
        }
        else if(win.sorted){
            winElement.classList.add("sorting")
            marginElement.classList.remove("sorting");
            stateElement.classList.remove("sorting");
            if(win.ascending){
                winElement.querySelector("i").className = "fas fa-sort-up"
            }
            else{
                winElement.querySelector("i").className = "fas fa-sort-down"
            }
            marginElement.querySelector("i").className = "fas no-display"
            stateElement.querySelector("i").className = "fas no-display"
        }
        
    }

    addGridlines(containerSelect, ticks) {
        ////////////
        // PART 3 // 
        ////////////
        /**
         * add gridlines to the vizualization
         */
        let gap = 37.5;
        containerSelect.selectAll("line").append("line")
         .data(ticks) 
         .join("line")
         .attr("class",function(d,i){
            if(i!=3){return "grid-lines"}
            else{return "grid-lines-center"}}
            )
         .attr("x1",(d,i)=>{return this.vizWidth/2-3*gap+i*gap})
         .attr("y1", 0)
         .attr("x2", (d,i)=>{return this.vizWidth/2-3*gap+i*gap})
         .attr("y2", this.vizHeight)
         
        

    }
    transformCoordinate(x) {
        let width = 300;
        return (x / 100 + 1) / 2 * width;
    }
    addRectangles(containerSelect) {
        let height = 25;
        let opacity = 0.3;

        // left bars
        containerSelect.append("rect")
            .join("rect")
            .attr("class",  "biden")
            .attr("x", d => this.transformCoordinate(d.value.marginLow) )
            .attr("y", this.vizHeight/2-height/2)
            .attr("width", (d, i) => {
                if (d.value.marginLow < 0) {
                    if (d.value.marginHigh > 0) {
                        // if cross the center, just stop at the center
                        return this.vizWidth / 2 - this.transformCoordinate(d.value.marginLow);
                    }
                    else {
                        // if not cross the center, just draw the full bar
                        return this.transformCoordinate(d.value.marginHigh)-this.transformCoordinate(d.value.marginLow);
                    }
                }
            })
            .attr("height", height)
            .style("opacity",opacity)
            
        
        // right bars
        containerSelect.append("rect")
            //.data(this.formatData)
            .join("rect")
            .attr("class",  "trump")
            .attr("x", d => {
                if (d.value.marginLow > 0) {
                    // cross the center, just use margin low
                    return this.transformCoordinate(d.value.marginLow);
                }
                else {
                    // if not cross the center, just draw the full bar
                    return this.vizWidth/2;
                }
            })
            .attr("y", this.vizHeight/2-height/2)
            .attr("width", (d, i) => {
                if (d.value.marginHigh > 0) {
                if (d.value.marginLow > 0) {
                    // cross the center, just use margin low
                    return this.transformCoordinate(d.value.marginHigh)-this.transformCoordinate(d.value.marginLow);
                }
                else {
                    // if not cross the center, just draw the full bar
                    return this.transformCoordinate(d.value.marginHigh) - this.vizWidth/2;
                }}
            })
            .attr("height", height)
            .style("opacity",opacity)
       
    }

    addCircles(containerSelect) {
        ////////////
        // PART 5 // 
        ////////////
        /**
         * add circles to the vizualizations
         */
        containerSelect.append("circle")
            //.data(this.formatData)
            .join("circle")
            .attr("class", function (d) {
                if (d.value.margin < 0) {
                    return "biden"
                }
                else {
                    return "trump"
                }
            })
            .attr("cx", d => this.transformCoordinate(d.value.margin))
            .attr("cy", this.vizHeight/2)
            .attr("r", d=> d.isForecast ?5:4)
            .style("stroke","black")
      
    }

    attachSortHandlers() 
    {
        d3.select("#columnHeaders").on('click',(d,data)=>{
            this.collapseAll()
            let state = this.headerData.find(e=>e.key==="state")
            let margin = this.headerData.find(e=>e.key==="mean_netpartymargin")
            let win = this.headerData.find(e=>e.key==="winner_Rparty")
            if(d.target.textContent == "State "){
                
                if(!state.sorted){
                    this.tableData.sort((a,b)=>(a.state>b.state)?1:-1)
                    state.ascending = true
                    state.sorted = true
                    margin.sorted = false
                    margin.ascending = false
                    win.sorted = false
                    win.ascending = false
                }
                else{
                    if(state.ascending){
                        this.tableData.sort((a,b)=>(a.state>b.state)?-1:1)
                        state.ascending = false
                    }
                    else{
                        this.tableData.sort((a,b)=>(a.state>b.state)?1:-1)
                        state.ascending = true
                    }
                }
            }
            else if(d.target.textContent == "Margin of Victory "){
                
                if(!margin.sorted){
                    this.tableData.sort((a,b)=>(Math.abs(a.mean_netpartymargin)>Math.abs(b.mean_netpartymargin))?1:-1)
                    margin.ascending = true
                    margin.sorted = true
                    state.sorted = false
                    state.ascending = false
                    win.sorted = false
                    win.ascending = false
                }
                else{
                    if(margin.ascending){
                        this.tableData.sort((a,b)=>(Math.abs(a.mean_netpartymargin)>Math.abs(b.mean_netpartymargin))?-1:1)
                        margin.ascending = false
                    }
                    else{
                        this.tableData.sort((a,b)=>(Math.abs(a.mean_netpartymargin)>Math.abs(b.mean_netpartymargin))?1:-1)
                        margin.ascending = true
                    }
                }
                
            }
            else if(d.target.textContent == "Wins "){
                
                if(!win.sorted){
                    this.tableData.sort((a,b)=>(Math.max(a.winner_Rparty, a.winner_Dparty)>Math.max(b.winner_Rparty, b.winner_Dparty))?-1:1)
                    win.ascending = true
                    win.sorted = true
                    margin.ascending = false
                    margin.sorted = false
                    state.sorted = false
                    state.ascending = false
                }
                else{
                    if(win.ascending){
                        this.tableData.sort((a,b)=>(Math.max(a.winner_Rparty, a.winner_Dparty)>Math.max(b.winner_Rparty, b.winner_Dparty))?1:-1)
                        win.ascending = false
                    }
                    else{
                        this.tableData.sort((a,b)=>(Math.max(a.winner_Rparty, a.winner_Dparty)>Math.max(b.winner_Rparty, b.winner_Dparty))?-1:1)
                        win.ascending = true
                    }
                }
            }
            this.drawTable();
        })



        
    }

  


    toggleRow(rowData, index) {
        ////////////
        // PART 8 // 
        ////////////
        /**
         * Update table data with the poll data and redraw the table.
         */

        let state = rowData.state

        // add poll data
        if(this.tableData[index+1].isForecast){
            this.tableData.splice.apply(this.tableData,[index+1,0].concat(this.pollData.get(state)))
        }
        else{
            // remove poll data
            let rowsToRemove = (this.pollData.get(state)).length
            this.tableData.splice(index+1, rowsToRemove); 
        }
        
        this.drawTable();
     
    }

    collapseAll() {
        this.tableData = this.tableData.filter(d => d.isForecast)
    }

}
/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(data) {
        this.tableData = data;
        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;
        
        this.scaleX = d3.scaleLinear()
            .domain([-100, 100])
            .range([0, this.vizWidth]);


        //this.attachSortHandlers();
        //this.drawLegend();
        // Todo:
        // set legend
        // get bar working
        this.drawTable()
        this.drawLegend()
    }

    drawLegend() {
        ////////////
        // PART 2 //
        ////////////
        /**
         * Draw the legend for the bar chart.
         */
        let widths = 100;
        let heights = 25;
        let legend = d3.select("#FrequencyAxis")

        let textData = ["0.0","0.5","1.0"]

        let gap = 37.5;
        legend.append("text")
            .data(textData)
            .attr("x", (d, i) => {
                console.log(d,i)
                return widths/2-3*gap+i*gap-15;
            })
            .attr("y", 15)
            .text((d)=>d)
        legend.append("line")
            .data(textData) 
            .attr("x1",(d,i)=>widths/3*i)
            .attr("y1", 0)
            .attr("x2",(d,i)=>widths/3*i)
            .attr("y2", 100)
    }
    
    drawTable() {
        console.log(this.tableData)
        let rowSelection = d3.select('#NgramTableBody')
            .selectAll('tr')
            .data(this.tableData)
            .join('tr')

        rowSelection.selectAll('td')
            .data(this.rowToCellDataTransform)
            .join('td') 
            .text((d, i) =>  {if (d.type =="text") { return d.value; } });
        //this.addGridlines();
        //this.addRectangles();
    }
    rowToCellDataTransform(d) {
        let speechInfo = {
            type: 'bar',
            d_speech: d.percent_of_d_speeches,
            r_speech: d.percent_of_r_speeches
        };
        let phrase = {
            type: 'text',
            value: d.phrase
        }
        let frequency = {
            type: 'bar',
            value: d.total/50
        }
        let total = {
            type: 'text',
            value: d.total
        }
        let dataList = [phrase, frequency,speechInfo, total];
        return dataList;
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

}
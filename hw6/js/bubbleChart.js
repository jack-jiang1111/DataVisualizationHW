const category = {
    "economy/fiscal issues":0,
    "energy/environment":1,
    "crime/justice":2,    
    "education":3,
    "health care":4,
    "mental health/substance abuse": 5
}

class Bubble {
    /**
     * Creates a bubble chart Object
     */
    constructor(data) {
        this.data = data
        this.vizWidth = 300;
        this.vizHeight = 30;
        this.smallVizHeight = 20;
        this.expanding = false;
        this.firstDraw = true;
        this.drawChart()
    }
    drawChart(){
        this.drawBubbles()
        this.drawWidgets()
    }
    drawBubbles(){
        let temp_data = this.data
        let bubbleChart = d3.select("#bubbles").selectAll("circle").data(temp_data)

        let svgHeight=1000
        let svgWidth=750

        let sizeScale = d3.scaleLinear()
        .domain([Math.min(...this.data.map((row) => row.total)),Math.max(...this.data.map((row) => row.total))])
        .range([3, 9])
        .nice();

        let xScale = d3.scaleLinear()
        .domain([Math.min(...this.data.map((row) => row.sourceX)),Math.max(...this.data.map((row) => row.sourceX))])
        .range([0, svgWidth])
        .nice();
        
        
        
        // draw the bubble chart
        let colorScale = ["#84bca8","#e2916c","#928cc5","#d487ba","#b1d469","#edd755"]
        if(this.firstDraw)
        {
            bubbleChart
            .join("circle")
            .attr("cx", d =>{
                if(this.expanding){
                    return xScale(d.moveX)
                }
                else{
                    return xScale(d.sourceX)
                }
            } )
            .attr("cy", d =>{
                if(this.expanding){
                    return xScale(d.moveY+150)
                }
                else{
                    return xScale(d.sourceY+150)
                }
                
            } )
            .attr("r", d=> sizeScale(d.total))
            .style("fill",d=>colorScale[category[d.category]])
            .style("stroke","black")
            .on('mouseover', (e,i) => {
                this.drawToolTip(i,xScale)
                d3.select(e.target).classed('hovered', true)
            })
            .on('mouseout', (e,i) =>{
                d3.select(e.target).classed('hovered', false)
                d3.select("#toolTip").selectAll("rect").remove()
                d3.select("#toolTip").selectAll("text").remove()
            });
            
        }
        else{
            bubbleChart
            .join("circle")
            .on('mouseover', (e,i) => {
                this.drawToolTip(i,xScale)
                d3.select(e.target).classed('hovered', true)
                
            })
            .on('mouseout', (e,i) =>{
                d3.select(e.target).classed('hovered', false)
                d3.select("#toolTip").selectAll("rect").remove()
                d3.select("#toolTip").selectAll("text").remove()
            })
            .transition()
            .duration(1500)
            .attr("cx", d =>{
                if(this.expanding){
                    return xScale(d.moveX)
                }
                else{
                    return xScale(d.sourceX)
                }
            } )
            .attr("cy", d =>{
                if(this.expanding){
                    return xScale(d.moveY+150)
                }
                else{
                    return xScale(d.sourceY+150)
                }
                
            } )
            .attr("r", d=> sizeScale(d.total))
            .style("fill",d=>colorScale[category[d.category]])
            .style("stroke","black")
            
        }
        
        let categoryList = ["Economy/fiscal issues",
        "Energy/environment",
        "Crime/justice",    
        "Education",
        "Health care",
        "Mental health/substance abuse"]
        // draw categogry list
        d3.select("#category").selectAll("text")
        .data(categoryList)
        .join("text")
        .text(d=>d)
        .transition()
        .duration(1500)
        .attr("x",0)
        .attr("y",(d,i)=>{if(this.expanding){return 100+i*110}else{return 100}})
        .attr("opacity",d=>{if(this.expanding){return 1}else{return 0}})
        
        this.drawAxis(svgHeight,svgWidth)
    }
    drawAxis(svgHeight,svgWidth){
        let leftMargin = 20
        let rightMargin = 20
        let xAxis = []
        let xAxisNum = [50,40,30,20,10,0,10,20,30,40,50]
        for(let i=0;i<=10;i++){
            xAxis.push((svgWidth-leftMargin-rightMargin)/10*i+leftMargin)
        }
        // draw the line
        d3.select("#linesAndAxis").selectAll("line")
        .data(xAxis)
        .join("line")
        .attr("x1",d=>d-leftMargin/2)
        .attr("y1",30)
        .attr("x2",d=>d-leftMargin/2)
        .attr("y2",40)
        .style("stroke","black")

        // draw text and axis
        d3.select("#axis").selectAll("text")
        .data(xAxis)
        .join("text")
        .attr("x",(d,i)=>{ if(i==5){;return d-leftMargin/4*3}else{return d-leftMargin;}
        })
        .attr("y",55)
        .text((d,i)=>(xAxisNum[i]))
        .style("stroke","black")
        
        d3.select("#axis")
        .append("text")
        .attr("x",0)
        .attr("y",20)
        .text("Democratic leaning")
        .style("stroke","black")

        d3.select("#axis")
        .append("text")
        .attr("x",svgWidth-160)
        .attr("y",20)
        .text("Republicain leaning")
        .style("stroke","black")

        // first draw don't draw animation
        if(this.firstDraw){
            d3.select("#middleLine").append("line")
            .join("line")
            .attr("x1",365)
            .attr("y1",65)
            .attr("x2",365)
            .attr("y2",d=>200)
            .style("stroke","black")
            this.firstDraw = false;
        }
        else{
            d3.select("#middleLine").selectAll("line")
            .join("line")
            .attr("x1",365)
            .attr("y1",65)
            .transition()
            .duration(1500)
            .attr("x2",365)
            .attr("y2",d=>{if(this.expanding){return 700}else{return 200}})
            .style("stroke","black")
        }
    }
    drawWidgets(){
        // add text
        d3.select("#header-widgets")
        .append("text")
        .text("Grouped by Topic")
        .attr("x",0)
        .attr("y",50)

        d3.select("#header-widgets")
        .append()
        
        // add show extreme
        d3.select("#header")
        .append("rect")
        .attr("x", 200 )
        .attr("y", 20)
        .attr("width", 100)
        .attr("height", 50)
        .style("fill","black")
        .style("stroke","blue")
        let temp = null;
        d3.select(".switch")
        .on("click",(event, d)=>{
            // somehow it called twice (checkbox and toggle)
            // so add a check so only called once
            if(event.target.type == "checkbox"){
                if(!this.expanding){
                    this.expanding = true;
                    this.drawBubbles();
                }
                else{
                    this.expanding = false;
                    this.drawBubbles();
                }
            }
            
        })
    }
    drawToolTip(data,xScale){
        //data.phrase
        //data.position
        //data.total/50
        let xgap = 30
        let ygap = 30
        d3.select("#toolTip").selectAll("rect").remove()
        d3.select("#toolTip").selectAll("text").remove()
        let renderData = [data.phrase.charAt(0).toUpperCase() + data.phrase.slice(1),
            "R "+(data.position<0?"":"+") + data.position.toFixed(2)+"%",
            "In "+Math.round(data.total*2)+"% of speeches"]

        let xpos = 0;
        let ypos = 0;
        if(this.expanding){
            xpos = xScale(data.moveX)
            ypos = xScale(data.moveY+150)
        }
        else{
            xpos = xScale(data.sourceX)
            ypos= xScale(data.sourceY+150)
        }
        d3.select("#toolTip").append("rect")
        .join("rect")
        .attr("x",xpos+xgap)
        .attr("y",ypos+ygap)
        .attr("width",150)
        .attr("height",80)
        .style("fill","white")
        .style("opacity",0.75)
        let text = d3.select("#toolTip").selectAll("text").data(renderData)
        text.join("text")   
        .text(d=>d)
        .attr("x",(d,i)=>{
            if(xpos+xgap<=580){
                return xpos+xgap;
            }
            else{
                return xpos-xgap-150;
            }
        })
        .attr("y",(d,i)=>{
            return ypos+ygap*1.5+i*25
        })
    }
}
words = d3.json('./data/words.json');
colorMap = {
    "economy/fiscal issues": "#84bca8",
    "energy/environment": "#e2916c",
    "crime/justice": "#928cc5",
    "education": "#d487ba",
    "health care": "#b1d469",
    "mental health/substance abuse": "#edd755"
}
Promise.all([d3.csv('./data/words-without-force-positions.csv'), words]).then( data =>
    {
        let table = new Table(data[1]);
        let bubblechart = new Bubble(data[1]);

        // const divOutput = d3.create('div');
        // divOutput.attr('id','selection-output').html('Selection: No brush')


        // d3.select('#bubbleChart')
        // .append('g').attr('id','brush-layer')
        // .call(d3.brush().on("start brush end", brushed))
       
        // // draw some circles
        // let bubbles = d3.select("#bubbles").selectAll("circle")
        // let svgWidth=750
        // let xScale = d3.scaleLinear()
        // .domain([Math.min(...bubblechart.data.map((row) => row.sourceX)),Math.max(...bubblechart.data.map((row) => row.sourceX))])
        // .range([0, svgWidth])
        // .nice();
        // // an object is passed into this function, and we are using the value of key selection
        // async function brushed({selection}){
        //     let value = [];
            
            
        //     // first we reset all bubbles
        //     bubbles.style("stroke", "grey")
        //         .style("fill", "grey")
            
        //     if (selection) {
        //     //selection is made with two array pairs to indicate the upper left and lower right corner of the brush, e.g.,[[10,20],[50,60]]
        //     //this syntax will give name of the values x0, y0, x1, y1
        //     const [[x0, y0], [x1, y1]] = selection;
        //     // we apply the filter to find the dots that are inside the brush
        //     if (bubblechart.expanding){
        //         value = bubbles.filter(d => x0 <= xScale(d.moveX) 
        //         && xScale(d.moveX) < x1 
        //         && y0 <= xScale(d.moveY+150) 
        //         && xScale(d.moveY+150) < y1)
        //         .style("fill",d=>colorMap[d.category])
        //         .style("stroke","black")
        //         .data();
        //     }
        //     else{
        //         value = bubbles.filter(d => x0 <= xScale(d.sourceX) 
        //                     && xScale(d.sourceX) < x1 
        //                     && y0 <= xScale(d.sourceY+150) 
        //                     && xScale(d.sourceY+150) < y1)
        //             .style("fill",d=>colorMap[d.category])
        //             .style("stroke","black")
        //             .data();
        //     }
            
        //     table.tableData = value
        //     table.drawTable();
        //     //await new Promise(r => setTimeout(r, 500));
        //     // // finally update the div with the data output.
        //     d3.select('#selection-output').html(`Selection: ${value.map((d,i)=>`${i}: [${d.sourceX}, ${d.sourceY}]`)}`)
        //     } else {    
        //     // there is no brush currently. so we want to update the selection to none
        //         bubbles.style("fill",d=>colorMap[d.category])
        //         .style("stroke","black")
        //         d3.select('#selection-output').html(`Selection: No brush`)
        //     }
           
        // }
    
          
    });//background: #88b6f7;
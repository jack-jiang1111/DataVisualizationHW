/** Class representing a Tree. */
class Tree {
    /**
    * Creates a Tree Object
    * Populates a single attribute that contains a list (array) of Node objects to be used by the other functions in this class
    * @param {json[]} json - array of json objects with name and parent fields
    */
    constructor(json) {
        this.Nodes = [];
        for (var i = 0; i < Object.keys(json).length; i++) {
            this.Nodes.push(new Node(json[i].name, json[i].parent));
        }
    }

    /**
    * Assign other required attributes for the nodes.
    */
    buildTree () {
        // note: in this function you will assign positions and levels by making calls to assignPosition() and assignLevel()
        // hook the trees using add child method
        for (var i = 0; i < this.Nodes.length; i++) {
            if (this.Nodes[i].parentName != "root") {
                for (var j = 0; j < this.Nodes.length; j++) {
                    if (this.Nodes[i].parentName == this.Nodes[j].name) {
                        this.Nodes[j].addChild(this.Nodes[i]);
                        this.Nodes[i].parentNode = this.Nodes[j];
                    }
                }
            }
        }
        this.assignPosition(this.Nodes[0], 0);
        this.assignLevel(this.Nodes[0], 0);
    }

    /**
    * Recursive function that assign levels to each node
    */
    assignLevel (node, level) {
        node.level = level;
        
        for (var i = 0; i < node.children.length; i++) {
            this.assignLevel(node.children[i], level + 1);
        }

    }

    // helper method used to count initialized position children for position calucalte
    CountChlidren(node) {
        if (node.children.length == 0 && node.position!=-1) {
            return 1;
        }
        var childrenCount = 0;
        for (var i = 0; i < node.children.length; i++) {
            childrenCount += this.CountChlidren(node.children[i])
        }
        return childrenCount;
    }
    /**
    * Recursive function that assign positions to each node
    */
    assignPosition (node, position) {
        if (node.parentName == "root") {
            node.position = 0;
        }
        else {
            var childrenCount = 0
            for (var i = 0; i < node.parentNode.children.length; i++) {
                childrenCount +=this.CountChlidren(node.parentNode.children[i])
            }
            node.position = node.parentNode.position + childrenCount;
        }
        for (var i = 0; i < node.children.length; i++) {
            this.assignPosition(node.children[i]);
        }
    }

    
    

    /**
    * Function that renders the tree
    */
    renderTree() {
        var bodySelection = d3.select("body");

        var svgSelection = bodySelection.append("svg")
            .attr("width", 1200)
            .attr("height", 1200);

        let xgap = 150;
        let ygap = 100;
        let cornerIndent = 0.4;

        this.drawLines(this.Nodes[0], svgSelection, xgap,ygap, cornerIndent)
        for (var i = 0; i < this.Nodes.length; i++) {
            let dx = (this.Nodes[i].level + cornerIndent) * xgap;
            let dy = (this.Nodes[i].position + cornerIndent) * ygap;

            var grouping = svgSelection
                .classed('nodeGroup', true)
                .append("g")
                .attr('transform', "translate(" + dx.toString() + "," + dy.toString() +")");
            grouping
                .append("circle")
                .attr("r", 40);
                
            grouping
                .append("text")
                .classed('label', true)
                .text(this.Nodes[i].name);
                
        }
      
    }
    // a helper method used to draw lines for svg
    drawLines(node, svg, xgap, ygap, cornerIndent) {
        for (var i = 0; i < node.children.length; i++) {
            let x1 = (node.level + cornerIndent) * xgap;
            let y1 = (node.position + cornerIndent) * ygap;

            let x2 = (node.children[i].level + cornerIndent) * xgap;
            let y2 = (node.children[i].position + cornerIndent) * ygap;

            svg.append("line")
                .attr('x1', x1)
                .attr('y1', y1)
                .attr('x2', x2)
                .attr('y2', y2);
            this.drawLines(node.children[i], svg, xgap,ygap, cornerIndent);
        }
    }
    

}
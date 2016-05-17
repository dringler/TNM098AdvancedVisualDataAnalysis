var prevClusterRes;
var clusterRes;

/**
* Scatter Plot
* @param data
*/
function sp(data){

    var self = this; // for internal d3 functions
    self.data = data;

    var spDiv = $("#sp");

    // var margin = [30, 10, 10, 10],
    //     width = pcDiv.width() - margin[1] - margin[3],
    //     height = pcDiv.height() - margin[0] - margin[2];
    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    
    //initialize tooltip
    var div = d3.select("body").append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);
    
    var x = d3.scale.ordinal().rangePoints([0, width], 1),
        y = {};

    // add the graph canvas to the body of the webpage
    var svg = d3.select("#sp").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    // var svg = d3.select("#pc").append("svg:svg")
    //     .attr("width", width + margin[1] + margin[3])
    //     .attr("height", height + margin[0] + margin[2])
    //     .append("svg:g")
    //     .attr("transform", "translate(" + margin[3] + "," + margin[0] + ")");

    

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    draw(data);

    /**
    * draw the PC
    * @param clusterResult
    */
    function draw(data){
        console.log("data");
        console.log(data);

        var extentTimestamp = d3.extent(data, function(d) { return +d.Timestamp;});
        document.getElementById('timeStartID').innerHTML = extentTimestamp[0];
        document.getElementById('timeEndID').innerHTML = extentTimestamp[1];

        document.getElementById("slider").min = extentTimestamp[0];
        document.getElementById("slider").max = extentTimestamp[1];
        document.getElementById("slider").value = extentTimestamp[1];

    // setup x 
    var xValue = function(d) { return d['X'];}, // data -> value
        xScale = d3.scale.linear().range([0, width]), // value -> display
        xMap = function(d) { return xScale(xValue(d));}, // data -> display
        xAxis = d3.svg.axis().scale(xScale).orient("bottom");

    // setup y
    var yValue = function(d) { return d["Y"];}, // data -> value
        yScale = d3.scale.linear().range([height, 0]), // value -> display
        yMap = function(d) { return yScale(yValue(d));}, // data -> display
        yAxis = d3.svg.axis().scale(yScale).orient("left");

    // setup fill color
    var cValue = function(d) { return d["type"];},
        color = d3.scale.category10();

    // scale axes
    // xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
    // yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);
    // static axes
    xScale.domain([0,100]);
    yScale.domain([0,100]);

    // x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
            .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("X");

    // y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
            .append("text")
                .attr("class", "label")
                .attr("transform", "rotate(-90)")
                .attr("y", 6)
                .attr("dy", ".71em")
                .style("text-anchor", "end")
                .text("Y");

    // draw dots
    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
            .attr("class", "dot")
            .attr("r", 3.5)
            .attr("cx", xMap)
            .attr("cy", yMap)
            .style("fill", function(d) { return color(cValue(d));}) 
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html( "Timestamp: " + d["Timestamp"] + "<br/>" 
                                + "ID: " + d["id"] + "<br/>"
                                + "Coordinates: " + xValue(d) + ", " + yValue(d))
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

    // draw legend
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    // draw legend text
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d;})


     
    //     // Add and store a brush for each axis.
    //     g.append("svg:g")
    //         .attr("class", "brush")
    //         .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
    //         .selectAll("rect")
    //         .attr("x", -8)
    //         .attr("width", 16);
    }

    //Filters data points according to the specified magnitude
    this.filterTime = function(value) {
        svg.selectAll("circle")
            .style("opacity", function(d){
                if (value < d["Timestamp"]) {return 0}
                else {return 1};
            })
    }

    // // Returns the path for a given data point.
    // function path(d) {
    //     return line(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
    // }

    // // Handles a brush event, toggling the display of foreground lines.
    // function brush() {
    //     var selectedLines = [];
    //     var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
    //         extents = actives.map(function(p) { return y[p].brush.extent(); });
    //     foreground.style("display", function(d) {
    //         return actives.every(function(p, i) {
    //             if(extents[i][0] <= d[p] && d[p] <= extents[i][1]) {selectedLines.push(d["id"])}
    //             return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    //         }) ? null : "none";
    //     });
    //     map1.filterAttributes(actives, extents);
    // }

    /**
    * update the data in the PC
    * @param newData
    * @param clusterRes
    */
    this.updateData = function(newData, clusterRes) {
        prevClusterRes = clusterRes;
        svg.selectAll("cicle").remove();
        svg.selectAll("g").remove();
        self.data = newData;

        draw(newData);
    };

    this.deleteCircles = function() {
        svg.selectAll("circle").remove();
    }

//     /**
//     * method for selecting a single line in the PC
//     * @param value: the id of the selected line
//     */
//     this.selectLine = function(value){
//         svg.selectAll("path").style("opacity", function(d) {
//             if (d.id != value) {return 0.2} 
//              else {return 1};
//         })
//     };

//     /**
//     * resets the user selections in the PC (brushing)
//     */
//     this.resetSelections = function(){
//         this.updateData(data, prevClusterRes);
//     }
}

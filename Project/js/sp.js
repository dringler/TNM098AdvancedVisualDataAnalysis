/**
* Scatter Plot
* @param data
*/
function sp(data){

    var self = this; // for internal d3 functions
    self.data = data;

    // global variables for draw & remove dots
    var dD;
    var rD;
    // global variable for draw & remove legend
    var dL;
    var rL;

    //global value for time range selection extent
    var gExtent0;
    var gExtent1;

    // color scale
    var color = d3.scale.category10();


    var spDiv = $("#sp");

    // var margin = [30, 10, 10, 10],
    //     width = pcDiv.width() - margin[1] - margin[3],
    //     height = pcDiv.height() - margin[0] - margin[2];
    var margin = {top: 20, right: 20, bottom: 20, left: 20},
        width = 600 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;
    
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
        // console.log("data");
        // console.log(data);

        // draw and remove dot functions
        dD = drawDots;
        rD = removeDots;
        //make drawLegend & removeLegend function globally available
        dL = drawLegend;
        rL = removeLegend;

        // var extentTimestamp = d3.extent(data, function(d) { return +d.Timestamp;});
        // var startTimestamp = moment.unix(extentTimestamp[0] / 1000);
        // var endTimestamp = moment.unix(extentTimestamp[1] / 1000);
        // document.getElementById('timeStartID').innerHTML = startTimestamp.format("DD-MM-YYYY HH:mm:ss");
        // document.getElementById('timeEndID').innerHTML = endTimestamp.format("DD-MM-YYYY HH:mm:ss");

        // document.getElementById("slider").min = extentTimestamp[0];
        // document.getElementById("slider").max = extentTimestamp[1];
        // document.getElementById("slider").value = extentTimestamp[1];

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
        var cValue = function(d) { return d["type"];};
        // ,    color = d3.scale.category10();

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


        //draw dots and legend
        drawDots();
        drawLegend();

        function drawDots() {
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
                        tooltip.html( "Timestamp: " 
                                        + moment.unix(d["Timestamp"] / 1000).format("DD-MM-YYYY HH:mm:ss") + "<br/>" 
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
        }
        function removeDots() {
            svg.selectAll(".dot").remove();
        }

        function drawLegend(){
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
        }
        function removeLegend() {
            svg.selectAll(".legend").remove();
        }
     
    //     // Add and store a brush for each axis.
    //     g.append("svg:g")
    //         .attr("class", "brush")
    //         .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush)); })
    //         .selectAll("rect")
    //         .attr("x", -8)
    //         .attr("width", 16);
    }

    this.showMap = function(value) {
        //delete old map
        svg.selectAll("defs").remove();
        svg.selectAll("rect").remove();
        //remove old legend
        rL();
        // remove old dots
        rD();
        // value: 0 = bw, 1 = color, 2 = hide
        var maplink = "data/Park_Map_bw.jpg";
        if (value != 2) {
            // check for color
            if (value == 1) {
                maplink = "data/Park_Map.jpg";
            }
            // background park map

            svg.append("defs")
                .append("pattern")
                    .attr("id", "bg")
                    .attr('patternUnits', 'userSpaceOnUse')
                    .attr('width', width)
                    .attr('height', height)
                .append("image")
                    .attr('width', width)
                    .attr('height', height)
                    .attr("xlink:href", maplink);

            svg.append("rect")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", width)
                .attr("height", height)
                .style("opacity", 0.2)
                .attr("fill", "url(#bg)");
        } else {
            svg.selectAll("defs").remove();
            svg.selectAll("rect").remove();
            

        }
        //redraw legend
        dL();
        //redraw dots
        dD(); 
        // apply the time filtering if time range extent is not undefined
        if (gExtent0 != undefined && gExtent1 != undefined) {
            this.filterTime(gExtent0, gExtent1);
        }
    }
    function removeMap() {
        svg.selectAll("defs").remove();
        svg.selectAll("rect").remove();
        //redraw legend
        rL();
        //redraw dots
        dL();
         // apply the time filtering if time range extent is not undefined
        if (gExtent0 != undefined && gExtent1 != undefined) {
            this.filterTime(gExtent0, gExtent1);
        }
    }

    //Filters data points according to the specified timestamp
    this.filterTime = function(extent0, extent1) {
        gExtent0 = extent0;
        gExtent1 = extent1;
        if(extent0 == extent1) {
            this.resetSelection();
        } else {
            svg.selectAll("circle").style("opacity", function(d){
                if (extent0 <= d["Timestamp"] && d["Timestamp"] <= extent1) {
                    return 1;
                } else {
                    return 0.1;
                }
            })
        } 
    }

    //method for selecting the dot from other components
    this.selectDot = function(value){
        svg.selectAll("circle").style("opacity", function(d) {
            if (value == new Date(d["Timestamp"])) {return 1;} 
             else {return 0.1;};
        })
    }

    // reset the selection (dot or time range)
    this.resetSelection = function() {
        svg.selectAll("circle").style("opacity", function(d) {
            return 1;
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
    this.updateData = function(newData) {
        svg.selectAll("circle").remove();
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

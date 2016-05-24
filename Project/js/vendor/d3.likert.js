/**
 * Display data for 7-point Likert scales using D3.js
 *
 * @author Dave Kelly ~ hello@davidkelly.ie | @davkell
 * @license mit license: http://opensource.org/licenses/MIT
 * @version 0.1
 * 
 *
 
 */
 //global rangeMaxValue for filterTime function
var maxValue;

// global referneces to other charts
var globalSP;
var globalCube;
var globalMainThis;

var d3Likert = function(element, dataObject, dimensions, sp1, cube1, mainThis){

    globalSP = sp1;
    globalCube = cube1;
    globalMainThis = mainThis;

    // global variable for clicked dot
    var dotSelected = false;

    var d3PrePropData = [];    

    var height = dimensions.height,
        width = dimensions.width,
        margin = {left: 20, right: 200, top: 80, bottom: 20};

    var svg = d3.select(element)
                .append('svg')
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .style("margin-left", margin.left + "px")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var color = d3.scale.category10();

    // var parseDate = d3.time.format('%d-%m-%Y %H:%M:%S').parse;
    var timeFormat = d3.time.format("%d-%m-%Y %H:%M:%S");
    var timeFormatAxis = d3.time.format("%H:%M:%S");


    // draw chart              
    draw(dataObject);

    function draw(dataObject) {

        var extentTimestamp = d3.extent(d3.entries(dataObject[0].ratingDate), function(d) { return new Date(d.key);});

        // var x = d3.scale.linear()
        var x = d3.time.scale()
                .range([0, width]);
                

         var xAxis = d3.svg.axis()
            .scale(x)
            .orient("top")
            .ticks(5)
            // .tickPadding(15)
            .tickFormat(timeFormatAxis);

        // var xScale = d3.scale.linear()
        var xScale = d3.time.scale()
            .range([0, width]);

        // domains
        x.domain([extentTimestamp[0], extentTimestamp[1]]);
        xScale.domain([extentTimestamp[0], extentTimestamp[1]]);

        // add x-axis
        svg.append("g")
            .attr("class", "x axis")
            // .attr("transform", "translate(100," + 60 + ")")
            .attr("transform", "translate(0," + 0 + ")")
            .style("font", "12px 'Helvetica Neue'")
            .call(xAxis);

        // 
        // get the min/max number of votes across all ratings
        // => necessary to keep the scales the same for each factor
        var totalMaxRatings = [];
        var totalMinRatings = [];
        var arr = [];

        $.each(dataObject, function(index, data){

            arr = d3.entries(data.ratingDate);
            var maxValue = d3.max(arr, function(d) { return +d.value; });
            var minValue = d3.min(arr, function(d) { return +d.value; });
            
            totalMaxRatings.push(maxValue);
            totalMinRatings.push(minValue);

        });

        maxValue = d3.max(totalMaxRatings, function(d){return +d});
        minValue = d3.min(totalMinRatings, function(d){return +d});
        

        // set up radius scales
        var rScale = d3.scale.linear()
            .domain([minValue, maxValue]);

        //apply smaller range for single visitor(ID)
        if (maxValue == 1) {
            rScale.range([1, 10]);
        } else {
            rScale.range([1, 30]);
        }
        
        // set up the tooltip for mouseovers
        var div = d3.select("body").append("div")   
            .attr("class", "tooltip")               
            .style("opacity", 0);

        // Add each rating row
        $.each(dataObject, function(index, data){
            
            var ratingArr = d3.entries(data.ratingDate);

            // get the max value within this rating
            rangeMaxValue = d3.max(ratingArr, function(d) { return +d.value; });

            var g = svg.append('g');
                        
            // used for setting a bg on the hover event
            var rect = g.selectAll('rect')
                        .data(ratingArr)
                        .enter()
                        .append('rect')
                        .attr('width', width)
                        .attr('height', 40)
                        .attr("x", 0)
                        .attr("y", (index * 40) + 80)
                        .style('fill', 'none');


            
            var circles = g.selectAll('circle')
                .data(ratingArr)
                .enter()
                .append('circle')
                    .attr("cx", function(d, i) { return xScale(new Date(d.key));})
                    .attr("cy", (index * 40) + 100)
                    .attr("r", function(d) { return rScale(+d.value); })
                    .attr("title", function(d){return d.value; })
                    .style("opacity", function(d) { 
                        // if this is the highest rated value,
                        // give it a different colour
                        if(d.value == maxValue){
                            // return 'rgb(252, 187, 161)';
                            return 0.9;
                        }else{
                            // return "#ccc";
                            return 0.6;
                        }    
                    })
                    .style("fill", function(d) {
                        return color(index);
                    })
                .on("mouseover", function(d) { 
                    div.transition()        
                        .duration(200)      
                        .style("opacity", 1);      
                    div .html('<strong>' + 
                    // moment(d.key).format("DD-MM-YYYY HH:mm:ss")
                    timeFormat(new Date(d.key))
                     + "</strong>: "  + d.value + " visitors")  
                        .style("left", (d3.event.pageX) + "px")     
                        .style("top", (d3.event.pageY - 28) + "px");    

                })                  
                .on("mouseout", function(d) {       
                    div.transition()        
                        .duration(500)      
                        .style("opacity", 0);   
                })
                .on("click", function(d) {
                        filterDots(d);
                    });

                function filterDots(selectedDot) {
                    if (dotSelected == false) {
                        svg.selectAll("circle")
                            .style("opacity", function(d){
                                date = new Date(d.key);
                                if (selectedDot.key == date) {
                                   return 1;
                                } else {
                                    return 0;
                                }
                            });
                            // scatter plot
                            globalSP.selectDot(selectedDot.key);
                            // cube
                            globalCube.selectDot(selectedDot.key);
                            dotSelected = true;  
                    } else { //reset selection
                        svg.selectAll("circle")
                            .style("opacity", function(d){
                                if(d.value == maxValue){
                                    return 0.9;
                                } else {
                                    return 0.6;
                                }    
                            });
                        //remove selection in SP
                        globalSP.resetSelection();
                        // remove selection in cube
                        globalCube.resetSelection();

                        globalMainThis.filterTimeFunction(document.getElementById("slider").value);
                        dotSelected = false;
                    }

                };


            // Add the actual values as text below the 
            // circles => used for display on label mouseover
            var text = g.selectAll("text")
                .data(ratingArr)
                .enter()
                .append("text");

            // text
            //     .attr("y", (index * 40) + 105)
            //     .attr("x",function(d, i) { return xScale(new Date(d.key)) - 12; })
            //     .attr("class","value")
            //     .style('fill', '#666')
            //     .text(function(d){ if(d.value>0) {return d.value;} })
            //     .style("display","none");

            // Y-axis labels (contain html)
            g.append("foreignObject")
                .attr("y", (index * 40) + 90)
                .attr("x", width+20)
                .attr("class","chart-label")
                .attr("width", 100)
                .attr("height", 40)
                // .on("mouseover", mouseover)
                // .on("mouseout", mouseout)
                .append("xhtml:body")
                .style("font", "12px 'Helvetica Neue'")
                .style("line-height", "16px")
                .style("background", "transparent")
                .html('<i class="glyphicon glyphicon-info-sign">&nbsp;</i>' + data.name );

            
        });

        // xAxis.orient("bottom");

        // svg.append("g")
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(386," + (height - 40) + ")")
        //     .style("font", "12px 'Helvetica Neue'")
        //     .call(xAxis);


        function mouseover(p) {
            var g = d3.select(this).node().parentNode;
            d3.select(g).style('cursor', "pointer");
            d3.select(g).selectAll('rect').attr('class', 'hover');
            d3.select(g).selectAll("circle").style("display","none");
            d3.select(g).selectAll("text.value").style("display","block");
        }

        function mouseout(p) {
            var g = d3.select(this).node().parentNode;
            
            d3.select(g).style('cursor', "normal");
            d3.select(g).selectAll('rect').attr('class', 'no-hover');
            d3.select(g).selectAll("circle").style("display","block");
            d3.select(g).selectAll("text.value").style("display","none");
        }
    }

    //Filters data points according to the specified timestamp
    this.filterTime = function(value) {
        svg.selectAll("circle")
            .style("opacity", function(d){
                date = new Date(d.key);
                time = +date;
                if (value < time) {return 0;}
                else {
                    if(d.value == maxValue){
                            // return 'rgb(252, 187, 161)';
                            return 0.9;
                        }else{
                            // return "#ccc";
                            return 0.6;
                        }    
                };
            })
        dotSelected = false;
    }

};
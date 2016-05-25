// based on http://bl.ocks.org/phil-pedruco/9852362

// define global variables
var points;
var pointsNonSelected;
var mat;
var matNonSelected;
var matDelete;
var scatterPlot;
var scene;
//data set
var unfiltered;

// color scale
var color = d3.scale.category10();

// global scales
var xScale,
    yScale,
    zScale;

function cube(dataObject){

    draw(dataObject);

    //update likert function
    this.updateCube = function(dataObject) {
        draw(dataObject);
    }

    //Filters data points according to the specified timestamp
    this.filterTime = function(extent0, extent1) {
        if(extent0 == extent1) {
            this.resetSelection();
        } else {
            // remove all points
            scatterPlot.remove(points);
            scatterPlot.remove(pointsNonSelected);
            // check which points should be shown
            var newPointGeo = new THREE.Geometry();
            var newPointGeoNonSelected = new THREE.Geometry();
            for (var i = 0; i < unfiltered.length; i ++) {
                var x = xScale(unfiltered[i].x);
                var y = yScale(unfiltered[i].y);
                var z = zScale(unfiltered[i].z);
                var type = unfiltered[i].type;  
                // check value against timestamp
                if(extent0 <= unfiltered[i].y*1000 && unfiltered[i].y*1000 <= extent1) {
                    newPointGeo.vertices.push(new THREE.Vector3(x, y, z));
                    newPointGeo.colors.push(new THREE.Color(color(type)));
                } else {
                    newPointGeoNonSelected.vertices.push(new THREE.Vector3(x, y, z));
                    newPointGeoNonSelected.colors.push(new THREE.Color(color(type)));
                }

            }
            // add points to scatter plot
            points = new THREE.Points(newPointGeo, mat);
            scatterPlot.add(points);
            // add non-selected points to scatter plot with less opacity
            pointsNonSelected = new THREE.Points(newPointGeoNonSelected, matNonSelected);
            scatterPlot.add(pointsNonSelected);
        }
    }

    //method for selecting the dot from other components
    this.selectDot = function(value){
        // remove all points
        scatterPlot.remove(points);
        scatterPlot.remove(pointsNonSelected);
        // check which points should be shown
        var newPointGeo = new THREE.Geometry();
        var newPointGeoNonSelected = new THREE.Geometry();
        for (var i = 0; i < unfiltered.length; i ++) {
            var x = xScale(unfiltered[i].x);
            var y = yScale(unfiltered[i].y);
            var z = zScale(unfiltered[i].z);
            var type = unfiltered[i].type;  
            // check value against timestamp
            if(value == new Date(unfiltered[i].y*1000)) {
                newPointGeo.vertices.push(new THREE.Vector3(x, y, z));
                newPointGeo.colors.push(new THREE.Color(color(type)));
            } else {
                newPointGeoNonSelected.vertices.push(new THREE.Vector3(x, y, z));
                newPointGeoNonSelected.colors.push(new THREE.Color(color(type)));
            }
        }
        // add selected points to scatter plot
        points = new THREE.Points(newPointGeo, mat);
        scatterPlot.add(points);
        // add non-selected points to scatter plot with less opacity
        pointsNonSelected = new THREE.Points(newPointGeoNonSelected, matNonSelected);
        scatterPlot.add(pointsNonSelected);

    }

    // reset the selection (dot or time range)
    this.resetSelection = function() {
        // remove all points
        scatterPlot.remove(points);
        scatterPlot.remove(pointsNonSelected);

        // check which points should be shown
        var newPointGeo = new THREE.Geometry();
            for (var i = 0; i < unfiltered.length; i ++) {
                // add all points
                var x = xScale(unfiltered[i].x);
                var y = yScale(unfiltered[i].y);
                var z = zScale(unfiltered[i].z);
                var type = unfiltered[i].type;    
                
                newPointGeo.vertices.push(new THREE.Vector3(x, y, z));
                newPointGeo.colors.push(new THREE.Color(color(type)));

            }
            // add points to scatter plot
            points = new THREE.Points(newPointGeo, mat);
            scatterPlot.add(points);


        // svg.selectAll("circle").style("opacity", function(d) {
        //     return 1;
        // })
    }


    function draw(dataObject) {


        function createTextCanvas(text, color, font, size) {
            size = size || 16;
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            var fontStr = (size + 'px ') + (font || 'Arial');
            ctx.font = fontStr;
            var w = ctx.measureText(text).width;
            var h = Math.ceil(size);
            canvas.width = w;
            canvas.height = h;
            ctx.font = fontStr;
            ctx.fillStyle = color || 'black';
            ctx.fillText(text, 0, Math.ceil(size * 0.8));
            return canvas;
        }

        function createText2D(text, color, font, size, segW, segH) {
            var canvas = createTextCanvas(text, color, font, size);
            var plane = new THREE.PlaneGeometry(canvas.width, canvas.height, segW, segH);
            var tex = new THREE.Texture(canvas);
            tex.needsUpdate = true;
            var planeMat = new THREE.MeshBasicMaterial({
                map: tex,
                color: 0xffffff,
                transparent: true
            });
            // double sided text
            planeMat.side = THREE.DoubleSide;
            var mesh = new THREE.Mesh(plane, planeMat);
            mesh.scale.set(0.5, 0.5, 0.5);
            mesh.doubleSided = true;
            // rotate the text 180°
            mesh.rotation.y = Math.PI ;
            return mesh;
        }

        // from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
        function hexToRgb(hex) { //TODO rewrite with vector output
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        }

        var renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        // var w = 960;
        // var h = 500;
        var w = 600;
        var h = 600;
        renderer.setSize(w, h);
        renderer.domElement.id = 'canvasID';
        var divID = document.getElementById("cubeDivID");
        divID.appendChild(renderer.domElement);

        // renderer.setClearColorHex(0xEEEEEE, 1.0);
        // renderer.setClearColor(new THREE.Color(0xEEEEEE, 1.0));
        // renderer.setClearColor( 0x000000, 0 ); // the default
        renderer.setClearColor( 0xffffff, 1.0 ); // white

        var camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
        camera.position.z = -150;
        camera.position.x = 0;
        camera.position.y = 130;

        scene = new THREE.Scene();

        scatterPlot = new THREE.Object3D();
        scene.add(scatterPlot);

        scatterPlot.rotation.y = 0;

        function v(x, y, z) {
            return new THREE.Vector3(x, y, z);
        }

        var format = d3.format("");

        // var data = d3.csv("data/defaultData.csv", function (d) {
        //     console.log(d);
        // $.each(dataObject, function(index, data){
        unfiltered = [];
            dataObject.forEach(function (d,i) {
                unfiltered[i] = {
                    // x: +d.x,
                    // y: +d.y,
                    // z: +d.z
                    x: +d.X,
                    y: +d.Timestamp/1000,
                    z: +d.Y,
                    type: d.type
                };
            })
        
        // console.log("unfiltered");
        // console.log(unfiltered);

            // var xExent = d3.extent(unfiltered, function (d) {return d.x; }),
            //     yExent = d3.extent(unfiltered, function (d) {return d.y; }),
            //     zExent = d3.extent(unfiltered, function (d) {return d.z; });
            var xExent = [0,100], //x coordinate
                yExent = d3.extent(unfiltered, function (d) {return d.y; }), //timestamp
                zExent = [0,100]; //y coordinate

            var vpts = {
                xMax: xExent[1],
                xCen: (xExent[1] + xExent[0]) / 2,
                xMin: xExent[0],
                yMax: yExent[1],
                yCen: (yExent[1] + yExent[0]) / 2,
                yMin: yExent[0],
                zMax: zExent[1],
                zCen: (zExent[1] + zExent[0]) / 2,
                zMin: zExent[0]
            }

            var colour = d3.scale.category20c();

            xScale = d3.scale.linear()
                          .domain(xExent)
                          .range([50,-50]); //flip axis
            yScale = d3.scale.linear()
                          .domain(yExent)
                          .range([50,-50]); // change direction so earlier timestamp is on top of the cube                
            zScale = d3.scale.linear()
                          .domain(zExent)
                          .range([-50,50]);


            // specify line appearance for cube outlines
            var lineMat = new THREE.LineBasicMaterial({
                color: 0x000000,
                lineWidth: 1
            });
            // define cube edges
            // eight smaller cubes 
            for (var i = 0; i < 8; i++) {
                var lineGeo = new THREE.Geometry();
                switch(i) {
                    case 0:
                        //box front top left
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    case 1:
                        //box front top right
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    case 2:
                        //box front bottom right
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    case 3:
                        //box front bottom left
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMin)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    case 4:
                        //box back top left
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    case 5:
                        //box back top right
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    case 6:
                        //box back bottom right
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    case 7:
                        //box back bottom left
                        lineGeo.vertices.push(
                            // top
                            v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)),
                            // bottom
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)),
                            v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zCen)),
                            v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zCen))             
                        );
                        break;
                    default:
                        // simple box outline
                        lineGeo.vertices.push(
                            //top
                            v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)),
                            v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)),
                            v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
                            v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),
                            // bottom
                            v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)),
                            v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
                            v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
                            v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax))             
                        );
                }
                // create line
                // var line = new THREE.Line(lineGeo, lineMat);
                // line.type = THREE.Lines;
                // scatterPlot.add(line);

                // create cube mesh object
                var cubeMesh = new THREE.Mesh(lineGeo, lineMat);

                // create cube and add it to the scatter plot
                var cube = new THREE.BoxHelper(cubeMesh);
                cube.material.color.set(0x000000);
                scatterPlot.add(cube);
            }

            // add titles to axes
            var titleX = createText2D('X: ' + format(xExent[0]));
            titleX.position.x = xScale(vpts.xMin) + 15,
            // titleX.position.y = 5;
            scatterPlot.add(titleX);

            // var valueX = createText2D(format(xExent[0]));
            // valueX.position.x = xScale(vpts.xMin) + 15,
            // valueX.position.y = -5;
            // scatterPlot.add(valueX);

            var titleX = createText2D('X: ' + format(xExent[1]));
            titleX.position.x = xScale(vpts.xMax) - 15;
            // titleX.position.y = 5;
            scatterPlot.add(titleX);

            // var valueX = createText2D(format(xExent[1]));
            // valueX.position.x = xScale(vpts.xMax) - 15,
            // valueX.position.y = -5;
            // scatterPlot.add(valueX);

            // var titleY = createText2D('-Y');
            var titleY = createText2D('Timestamp');
            titleY.position.y = yScale(vpts.yMin) + 15;
            scatterPlot.add(titleY);

            // var valueY = createText2D(format(yExent[0]));
            var valueY = createText2D(moment.unix(yExent[0]).format("DD-MM-YYYY HH:mm:ss"));
            valueY.position.y = yScale(vpts.yMin) + 5,
            scatterPlot.add(valueY);

            // var titleY = createText2D('Y');
            var titleY = createText2D('Timestamp');
            titleY.position.y = yScale(vpts.yMax) - 5;
            scatterPlot.add(titleY);

            // var valueY = createText2D(format(yExent[1]));
            var valueY = createText2D(moment.unix(yExent[1]).format("DD-MM-YYYY HH:mm:ss"));
            valueY.position.y = yScale(vpts.yMax) - 15,
            scatterPlot.add(valueY);

            // var titleZ = createText2D('-Z ' + format(zExent[0]));
            var titleZ = createText2D('Y: ' + format(zExent[0]));
            titleZ.position.z = zScale(vpts.zMin) - 5;
            scatterPlot.add(titleZ);

            // var titleZ = createText2D('Z ' + format(zExent[1]));
            var titleZ = createText2D('Y: ' + format(zExent[1]));
            titleZ.position.z = zScale(vpts.zMax) + 5;
            scatterPlot.add(titleZ);

            // var mat = new THREE.ParticleBasicMaterial({
            mat = new THREE.PointsMaterial({
                vertexColors: true,
                opacity: 1,
                transparent: true,
                size: 5
            });
            //material for non selected dots with less opacity
            matNonSelected = new THREE.PointsMaterial({
                vertexColors: true,
                opacity: 0.1,
                transparent: true,
                size: 5
            });

            var pointCount = unfiltered.length;
            var pointGeo = new THREE.Geometry();
            for (var i = 0; i < pointCount; i ++) {
                var x = xScale(unfiltered[i].x);
                var y = yScale(unfiltered[i].y);
                var z = zScale(unfiltered[i].z);
                var type = unfiltered[i].type;    

                pointGeo.vertices.push(new THREE.Vector3(x, y, z));
                pointGeo.colors.push(new THREE.Color(color(type)));

            }
            // var points = new THREE.ParticleSystem(pointGeo, mat);
            points = new THREE.Points(pointGeo, mat);
            scatterPlot.add(points);

            renderer.render(scene, camera);
            var paused = false;
            var last = new Date().getTime();
            var down = false;
            var sx = 0,
                sy = 0;

            var canvasElement = document.getElementById('canvasID');
                
            // window.onmousedown = function(ev) {
            canvasElement.onmousedown = function(ev) {
                down = true;
                sx = ev.clientX;
                sy = ev.clientY;
            };
            // window.onmouseup = function() {
            canvasElement.onmouseup = function(ev) {
                down = false;
            };
            // window.onmousemove = function(ev) {
            canvasElement.onmousemove = function(ev) {
                if (down) {
                    var dx = ev.clientX - sx;
                    var dy = ev.clientY - sy;
                    scatterPlot.rotation.y += dx * 0.01;
                    camera.position.y += dy;
                    sx += dx;
                    sy += dy;
                }
            }

           

            // canvasElement.onwheel = function(ev) {
            //     console.log(ev);
            //     var d = ((typeof ev.wheelDelta != "undefined")?(-ev.wheelDelta):ev.detail);
            //     d = 100 * ((d>0)?1:-1);    
            //     var cPos = camera.position;
            //     if (isNaN(cPos.x) || isNaN(cPos.y) || isNaN(cPos.y)) return;

            //     // Your zomm limitation
            //     // For X axe you can add anothers limits for Y / Z axes
            //     if (cPos.x > 0 || cPos.x < 100 ){
            //         return ;
            //     }

            //     mb = d>0 ? 1.1 : 0.9;
            //     cPos.x = cPos.x * mb;
            //     cPos.y = cPos.y * mb;
            //     cPos.z = cPos.z * mb;       
            //     console.log(mb);

            // }

            var animating = false;
            // window.ondblclick = function() {
            canvasElement.ondblclick = function() {

                animating = !animating;
            };

            function animate(t) {
                if (!paused) {
                    last = t;
                    if (animating) {
                        var v = pointGeo.vertices;
                        for (var i = 0; i < v.length; i++) {
                            var u = v[i];
                            // console.log(u)
                            u.angle += u.speed * 0.01;
                            u.x = Math.cos(u.angle) * u.radius;
                            u.z = Math.sin(u.angle) * u.radius;
                        }
                        pointGeo.__dirtyVertices = true;
                    }
                    renderer.clear();
                    camera.lookAt(scene.position);
                    renderer.render(scene, camera);
                }
                window.requestAnimationFrame(animate, renderer.domElement);
                // $("#cubeDivID").requestAnimationFrame(animate, renderer.domElement);

            };
            animate(new Date().getTime());
            onmessage = function(ev) {
                paused = (ev.data == 'pause');
            };
    }
    // })
}

// based on http://bl.ocks.org/phil-pedruco/9852362

// define global variables
var points;
var mat;
var matDelete;
var scatterPlot;
var scene;
//data set
var unfiltered = [];

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
    this.filterTime = function(value) {
        // remove all points
        scatterPlot.remove(points);

        var newPointGeo = new THREE.Geometry();
            for (var i = 0; i < unfiltered.length; i ++) {
                // check value against timestamp
                if(value >= unfiltered[i].y*1000) {
                    var x = xScale(unfiltered[i].x);
                    var y = yScale(unfiltered[i].y);
                    var z = zScale(unfiltered[i].z);
                    var type = unfiltered[i].type;    

                    newPointGeo.vertices.push(new THREE.Vector3(x, y, z));
                    newPointGeo.colors.push(new THREE.Color(color(type)));
                }

            }
            // add points to scatter plot
            points = new THREE.Points(newPointGeo, mat);
            scatterPlot.add(points);
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
            var mesh = new THREE.Mesh(plane, planeMat);
            mesh.scale.set(0.5, 0.5, 0.5);
            mesh.doubleSided = true;
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
        camera.position.z = 200;
        camera.position.x = -100;
        camera.position.y = 100;

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
                          .range([-50,50]);
            yScale = d3.scale.linear()
                          .domain(yExent)
                          .range([50,-50]); // change direction so earlier timestamp is on top of the cube                
            zScale = d3.scale.linear()
                          .domain(zExent)
                          .range([-50,50]);

            var lineGeo = new THREE.Geometry();
            lineGeo.vertices.push(
                v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zCen)),
                v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zCen)),
                v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xCen), yScale(vpts.yCen), zScale(vpts.zMin)),

                v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
                v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)),
                v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
                v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),

                v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)),
                v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMin)),
                v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zCen)),
                v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zCen)),

                v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)),
                v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)),
                v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
                v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)),

                v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMax)),
                v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)),
                v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zCen)),
                v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zCen)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zCen)),

                v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMax), zScale(vpts.zMax)),
                v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yMin), zScale(vpts.zMax)),
                v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yMax), zScale(vpts.zMax)),
                v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yMin), zScale(vpts.zMax)),

                v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMin)), v(xScale(vpts.xMin), yScale(vpts.yCen), zScale(vpts.zMax)),
                v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMin)), v(xScale(vpts.xMax), yScale(vpts.yCen), zScale(vpts.zMax)),
                v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMax), zScale(vpts.zMin)),
                v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMin)), v(xScale(vpts.xCen), yScale(vpts.yMin), zScale(vpts.zMax))

            );
            var lineMat = new THREE.LineBasicMaterial({
                color: 0x000000,
                lineWidth: 1
            });
            var line = new THREE.Line(lineGeo, lineMat);
            line.type = THREE.Lines;
            scatterPlot.add(line);

            var titleX = createText2D('X');
            titleX.position.x = xScale(vpts.xMin) - 12,
            titleX.position.y = 5;
            scatterPlot.add(titleX);

            var valueX = createText2D(format(xExent[0]));
            valueX.position.x = xScale(vpts.xMin) - 12,
            valueX.position.y = -5;
            scatterPlot.add(valueX);

            var titleX = createText2D('X');
            titleX.position.x = xScale(vpts.xMax) + 12;
            titleX.position.y = 5;
            scatterPlot.add(titleX);

            var valueX = createText2D(format(xExent[1]));
            valueX.position.x = xScale(vpts.xMax) + 12,
            valueX.position.y = -5;
            scatterPlot.add(valueX);

            // var titleY = createText2D('-Y');
            var titleY = createText2D('Timestamp');
            titleY.position.y = yScale(vpts.yMin) - 5;
            scatterPlot.add(titleY);

            // var valueY = createText2D(format(yExent[0]));
            var valueY = createText2D(moment.unix(yExent[0]).format("DD-MM-YYYY HH:mm:ss"));
            valueY.position.y = yScale(vpts.yMin) - 15,
            scatterPlot.add(valueY);

            // var titleY = createText2D('Y');
            var titleY = createText2D('Timestamp');
            titleY.position.y = yScale(vpts.yMax) + 15;
            scatterPlot.add(titleY);

            // var valueY = createText2D(format(yExent[1]));
            var valueY = createText2D(moment.unix(yExent[1]).format("DD-MM-YYYY HH:mm:ss"));
            valueY.position.y = yScale(vpts.yMax) + 5,
            scatterPlot.add(valueY);

            // var titleZ = createText2D('-Z ' + format(zExent[0]));
            var titleZ = createText2D('Y ' + format(zExent[0]));
            titleZ.position.z = zScale(vpts.zMin) + 2;
            scatterPlot.add(titleZ);

            // var titleZ = createText2D('Z ' + format(zExent[1]));
            var titleZ = createText2D('Y ' + format(zExent[1]));
            titleZ.position.z = zScale(vpts.zMax) + 2;
            scatterPlot.add(titleZ);

            // var mat = new THREE.ParticleBasicMaterial({
            mat = new THREE.PointsMaterial({
                vertexColors: true,
                opacity: 1,
                transparent: true,
                size: 10
            });

            var pointCount = unfiltered.length;
            var pointGeo = new THREE.Geometry();
            for (var i = 0; i < pointCount; i ++) {
                var x = xScale(unfiltered[i].x);
                var y = yScale(unfiltered[i].y);
                var z = zScale(unfiltered[i].z);
                var type = unfiltered[i].type;    

                pointGeo.vertices.push(new THREE.Vector3(x, y, z));
                // console.log(pointGeo.vertices);
                //pointGeo.vertices[i].angle = Math.atan2(z, x);
                //pointGeo.vertices[i].radius = Math.sqrt(x * x + z * z);
                //pointGeo.vertices[i].speed = (z / 100) * (x / 100);
                // pointGeo.colors.push(new THREE.Color().setRGB(
                //   hexToRgb(colour(i)).r / 255, hexToRgb(colour(i)).g / 255, hexToRgb(colour(i)).b / 255 
                // ));
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

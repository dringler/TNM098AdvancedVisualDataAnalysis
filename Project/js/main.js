/**
 * open http://127.0.0.1:8888/index.html for accessing the web application
 */

var sp1;
//global user input parameters
var previousUserSelection;
var currentUserSelection;

var data;
var gData;
var gID = 0;

// parse Date
var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

/**
 * initial page load
 */
function init() {
	//save standard selection
	currentUserSelection = getUserSelection();

	//time parsing 2013-03-25 17:59:00;
	//var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S");
	


	//load sample data
	d3.json("php/data_friday_sample.php", function (data) {
		//console.log("data");
		//console.log(data);
	//d3.csv("data/park-movement-Fri_sample_300.csv", function(error, data) {

		data.forEach(function(d) {
		    d["Timestamp"] = +parseDate(d["Timestamp"])
		    d["id"] = +d["id"]
		    d["type"] = d["type"]
		    d["X"] = +d["X"]
		    d["Y"] = +d["Y"]
			//increment global ID
			gID += 1;
		})
		sp1 = new sp(data);
		//Calls the filtering function 
    	d3.select("#slider").on("input", function () {
        	sp1.filterTime(this.value, data);
    	});
	});
	previousUserSelection = currentUserSelection;
}
/**
 * run the clustering algorithm
 */
function run() {
	var reloadChartsRequired = false;
	//check if user selection changed for dataset or preprocessing
	currentUserSelection = getUserSelection();


	// get data based on user attributes. based on:
	// http://www.scriptscoop2.com/t/0f72a816aa4c/javascript-d3-js-how-to-pass-parameter-to-php-for-query-condition.html
	$.ajax({
    	url: "php/data.php",
        type: "GET",
        data: {
        	day: currentUserSelection.datasetDayString,
            limit: document.getElementById("limitID").value,
            offset: document.getElementById("offsetID").value
    	},
        dataType: "json",
        success: function (data) {
	        //console.log("RESULT FROM PHP QUERY RECEIVED");
	        sp1.deleteCircles();
	        data.forEach(function(d) {
				d["Timestamp"] = +parseDate(d["Timestamp"])
				d["id"] = +d["id"]
				d["type"] = d["type"]
				d["X"] = +d["X"]
				d["Y"] = +d["Y"]
			}) 
	        gData = data;
			//update data in charts
			sp1.updateData(gData, clusterRes);
        },
        error: function () {
            console.log("NO RESULT FROM PHP QUERY RECEIVED");
        }
    });

	//save user selection
	previousUserSelection = currentUserSelection;

}
/**
 * get the current user selection parameters
 * 
 * @return returnObject user selection
 */
function getUserSelection() {
	//create return object
	var userSelection = {};
	//create variables for return object
	// var DMa; //data mining algorithm, 0:BIRCH, 1:kMeans
	// var DMp = []; //data mining parameters
	//get user selection
	var datasetDay = 0;
	var datasetDayString ="friday";
	var datasetFriday = document.getElementById('dayFridayID').checked;
	var datasetSaturday = document.getElementById('daySaturdayID').checked;
	var datasetSunday = document.getElementById('daySundayID').checked;
	if (datasetSaturday == true) {
	 	datasetDay = 1;
	 	datasetDayString = "saturday";
	} else if (datasetSunday == true) {
		datasetDay = 2;
		datasetDayString = "sunday";
	}

	// var normalizeDataset = document.getElementById('ppNormID').checked;
	// var applyBirch = document.getElementById('birchID').checked;
	// var areaYparameter = document.getElementById('areaYvalueID').value;

	//get specific parameters of the DM algorithm
	//BIRCH
	// if (applyBirch) {
	// 	DMa = 0;
	// 	var threshold = document.getElementById('birchThID').value;
	// 	var branching_factor = document.getElementById('birchBfID').value;
	// 	var n_clusters = ""; //document.getElementById('birchNcID').value;
	// 	DMp.push(threshold, branching_factor, n_clusters);
	// } else { //KMeans
	// 	DMa = 1;
	// 	var k = document.getElementById('kInputID').value;
	// 	DMp.push(k);
	// }
	
	//save user selection in return object
	userSelection.datasetDay = datasetDay;
	userSelection.datasetDayString = datasetDayString;
	// userSelection.normalizeDataset = normalizeDataset;
	// userSelection.areaYparameter = areaYparameter;
	// userSelection.DMa = DMa;
	// userSelection.DMp = DMp;

	return userSelection;
}

/**
 * shows or hides input fields based on selected DM algorithm
 */
 function idSelectionClick() {
 	var singleIdChecked = document.getElementById('singleID').checked;
 	if (singleIdChecked == true) {
 		//show
 		document.getElementById('singleIDdiv').style.display = "block";
 		// https://css-tricks.com/dynamic-dropdowns/
 		// http://stackoverflow.com/questions/17760866/fill-html-dropdown-box-with-external-json-file-data
 		$.getJSON("data/distinct_IDs.json", function(data) {
 			var $IDselectionID = $("#IDselectionID");
 			$IDselectionID.empty();
 			$.each(data, function(i, v) {
 				$IDselectionID.append("<option>" + v.id + "</option>");
 			});
 		});
 	} else {
 		//hide
 		document.getElementById('singleIDdiv').style.display = "none";
 	}
 }




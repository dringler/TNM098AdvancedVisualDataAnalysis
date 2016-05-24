/**
 * open http://127.0.0.1:8888/index.html for accessing the web application
 */

var sp1;
var likert1;
var cube1;
//global user input parameters
var previousUserSelection;
var currentUserSelection;

//global value for current selection on time slider
var currentTimeFilterValue;

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
		cube1 = new cube(data);
		likert1 = new likert(data, sp1, cube1, this);

		// get current silder value
		currentTimeFilterValue = document.getElementById("slider").value;
		// show map based on user selection
		showHideMap();

		//Calls the filtering function 
    	d3.select("#slider").on("input", function () {
    		currentTimeFilterValue = this.value;
    		filterTimeFunction(currentTimeFilterValue);
    	});
	});
	previousUserSelection = currentUserSelection;
}


/**
 * run the filter time function for all charts
 */
this.filterTimeFunction = function(value) {
	//update currentTimeFilterValue (might be updated from likert chart)
	currentTimeFilterValue = value;
	// filter time for each chart
	sp1.filterTime(value, data);
    likert1.filterTime(value, data);
    cube1.filterTime(value, data);
}

/**
 * run the clustering algorithm
 */
function run() {
	// delete old dots in scatter plot
	sp1.deleteCircles();

	//remove old likert chart
    $('#display-likert-chart').empty(); // clear content of the div tag

    //remove cube
    document.getElementById("canvasID").remove(); // remove the whole canvas element from the DOM


	//check if user selection changed for dataset or preprocessing
	currentUserSelection = getUserSelection();


	// get data based on user attributes. based on:
	// http://www.scriptscoop2.com/t/0f72a816aa4c/javascript-d3-js-how-to-pass-parameter-to-php-for-query-condition.html
	$.ajax({
    	url: "php/data.php",
        type: "GET",
        data: {
        	day: currentUserSelection.datasetDayString,
        	allIDsChecked: currentUserSelection.allIDsChecked,
        	selectedID: currentUserSelection.selectedID,
            limit: document.getElementById("limitID").value,
            offset: document.getElementById("offsetID").value
    	},
        dataType: "json",
        success: function (data) {
	        //console.log("RESULT FROM PHP QUERY RECEIVED");
	        
	        data.forEach(function(d) {
				d["Timestamp"] = +parseDate(d["Timestamp"])
				d["id"] = +d["id"]
				d["type"] = d["type"]
				d["X"] = +d["X"]
				d["Y"] = +d["Y"]
			}) 
	        gData = data;
			//update data in charts
			sp1.updateData(gData);
			likert1.updateLikert(gData);
			cube1.updateCube(gData);
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

	var allIDsChecked = document.getElementById('allID').checked;
	userSelection.allIDsChecked = allIDsChecked;
	// console.log("allIDsChecked");
	// console.log(allIDsChecked);

	var selectedID = 0;

	//get selected ID if single ID is selected
	if (allIDsChecked == false) {
		//http://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
		var e = document.getElementById("IDselectionID");
		var selectedID = e.options[e.selectedIndex].text;
		
	}
	userSelection.selectedID = selectedID;
	// console.log("selectedID");
	// console.log(selectedID);

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
 * get IDs for selected day in dropdown when user clicks on single ID
 */
 function idSelectionClick() {
 	var singleIdChecked = document.getElementById('singleID').checked;
 	if (singleIdChecked == true) {
 		//show
 		document.getElementById('singleIDdiv').style.display = "block";

 		var jsonDataPath = "data/distinct_IDs.json";
 		var currentUserSelection = getUserSelection();
 		if (currentUserSelection.datasetDayString == "friday") {
 			jsonDataPath = "data/distinct_IDs_friday.json";
 		} else if (currentUserSelection.datasetDayString == "saturday") {
 			jsonDataPath = "data/distinct_IDs_saturday.json";
 		} else {
 			jsonDataPath = "data/distinct_IDs_sunday.json";
 		}


 		// https://css-tricks.com/dynamic-dropdowns/
 		// http://stackoverflow.com/questions/17760866/fill-html-dropdown-box-with-external-json-file-data
 		$.getJSON(jsonDataPath, function(data) {
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
 /**
 * show or hide the map in the background of the scatter plot
 */
 function showHideMap() {
 	var showMapBw = document.getElementById('showMapBwID').checked;
 	var showMapColor = document.getElementById('showMapColorID').checked;
 	if (showMapBw == true) {
 		sp1.showMap(0);
 	} else if (showMapColor == true) {
 		sp1.showMap(1);
 	} else {
 		sp1.showMap(2);
 	}
 	filterTimeFunction(currentTimeFilterValue);
 	
 }




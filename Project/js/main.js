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
// var currentTimeFilterValue;

var data;
var gData;
var gID = 0;

// parse Date
var parseDate = d3.time.format("%Y-%m-%d %H:%M:%S").parse;

/**
 * initial page load
 */
function init() {
	var startTime = new Date().getTime();

	//save standard selection
	currentUserSelection = getUserSelection();

	//load sample data
	d3.json("php/data_friday_sample.php", function (data) {

		 var successTime = new Date().getTime() - startTime;
	     console.log("Data retrieved in " + successTime + " ms");

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
		// currentTimeFilterValue = document.getElementById("slider").value;
		// show map based on user selection
		showHideMap();

		console.log("INITIAL PAGE LOAD DURATION IN MS:");
		console.log(new Date().getTime() - startTime);

	});
	previousUserSelection = currentUserSelection;
	

}


/**
 * run the clustering algorithm
 */
function run() {
	var startTime = new Date().getTime();

	// delete old dots in scatter plot
	sp1.deleteCircles();

	//remove old likert chart
    $('#display-likert-chart').empty(); // clear content of the div tag

    //remove cube
    document.getElementById("canvasID").remove(); // remove the whole canvas element from the DOM

	//check if user selection changed for dataset or preprocessing
	currentUserSelection = getUserSelection();
	console.log(currentUserSelection);

	// get data based on user attributes. based on:
	// http://www.scriptscoop2.com/t/0f72a816aa4c/javascript-d3-js-how-to-pass-parameter-to-php-for-query-condition.html
	$.ajax({
    	url: "php/data.php",
        type: "GET",
        data: {
        	day: currentUserSelection.datasetDayString,
        	allIDsChecked: currentUserSelection.allIDsChecked,
        	selectedID: currentUserSelection.selectedID,
        	typeSelectionString: currentUserSelection.typeSelectionString,
            limit: currentUserSelection.limit,
            offset: currentUserSelection.offset,
            sampling: currentUserSelection.sampling,
            samplingRate: currentUserSelection.samplingRate
    	},
        dataType: "json",
        success: function (data) {
	        //console.log("RESULT FROM PHP QUERY RECEIVED");
	        console.log(data);
	        var successTime = new Date().getTime() - startTime;
	        console.log("Data retrieved in " + successTime + " ms");
	        console.log(successTime);
	        
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

			console.log("CHART UPDATE DURATION IN MS FOR "+ currentUserSelection.datasetDayString + 
		" with allIDsChecked = " + currentUserSelection.allIDsChecked +
		" , selectedID: "+ currentUserSelection.selectedID +
		" and with " + document.getElementById("limitID").value +
		 " entries:");
	console.log(new Date().getTime() - startTime);
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
	//get user selection
	//get dataset day selection
	var datasetDayString ="friday";
	var datasetSaturday = document.getElementById('daySaturdayID').checked;
	var datasetSunday = document.getElementById('daySundayID').checked;
	if (datasetSaturday == true) {
	 	datasetDayString = "saturday";
	} else if (datasetSunday == true) {
		datasetDayString = "sunday";
	}

	// add limit and offset values
	userSelection.limit = document.getElementById("limitID").value;
    userSelection.offset = document.getElementById("offsetID").value;

   	// get sampling values
    userSelection.sampling = document.getElementById('samplingID').checked;
    userSelection.samplingRate = document.getElementById('samplingRateInputID').value;

	// get ID selection
	var allIDsChecked = document.getElementById('allID').checked;
	userSelection.allIDsChecked = allIDsChecked;


	var selectedID = 0;
	//get selected ID if single ID is selected
	if (allIDsChecked == false) {
		//http://stackoverflow.com/questions/1085801/get-selected-value-in-dropdown-list-using-javascript
		var e = document.getElementById("IDselectionID");
		var selectedID = e.options[e.selectedIndex].text;
		
	}
	userSelection.selectedID = selectedID;

	//get type selection
	var typeSelectionString = "";
	if (document.getElementById("checkInID").checked) {
		typeSelectionString = "check-in";
	} else if (document.getElementById("movementID").checked) {
		typeSelectionString = "movement";
	}
	userSelection.typeSelectionString = typeSelectionString;


	// var normalizeDataset = document.getElementById('ppNormID').checked;
	// var applyBirch = document.getElementById('birchID').checked;
	// var areaYparameter = document.getElementById('areaYvalueID').value;


	
	//save user selection in return object

	userSelection.datasetDayString = datasetDayString;

	return userSelection;
}

/**
 * show or hide input field for sampling rate
 */
function samplingClick() {
	var samplingChecked = document.getElementById('samplingID').checked;
	if (samplingChecked == true) {
		document.getElementById('samplingRateID').style.display = "block";

	} else {
		document.getElementById('samplingRateID').style.display = "none";
	}
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
 	// filterTimeFunction(currentTimeFilterValue);
 	
 }




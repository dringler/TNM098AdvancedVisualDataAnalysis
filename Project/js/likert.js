var likObj;

function likert(data){
    var likertData = processData(data);   
    drawChart(likertData);

    //update likert function
    this.updateLikert = function(data) {
        //process new data
        var likertData = processData(data);
        // draw new chart
        likObj = new d3Likert('#display-likert-chart', likertData, {height: 400, width: $('#display-likert-chart').width() });
    }

    this.filterTime = function(value) {
        likObj.filterTime(value, data);
    }

    function drawChart(likertData) {
        // call the chart
        likObj = new d3Likert('#display-likert-chart', likertData, {height: 400, width: $('#display-likert-chart').width() });
    }


    function processData(data) {
        // get all distinct timestamp from data array
        // http://stackoverflow.com/questions/15125920/how-to-get-distinct-values-from-an-array-of-objects-in-javascript
        var unique = {};
        var countCheckIn = {};
        var countMovement = {};
        var countCheckInDate = {};
        var countMovementDate = {};
        var distinct = [];
        for( var i in data ){
            var newTimestamp = data[i].Timestamp/1000;
            var newTimestampDate = new Date(data[i].Timestamp);
            if( typeof(unique[newTimestamp]) == "undefined"){
                distinct.push(newTimestamp);
                if (data[i].type == "check-in") {
                    countCheckIn[newTimestamp] = 1;
                    countMovement[newTimestamp] = 0;
                    //date object
                    countCheckInDate[newTimestampDate] = 1;
                    countMovementDate[newTimestampDate] = 0;
                } else {
                    countMovement[newTimestamp] = 1;
                    countCheckIn[newTimestamp] = 0;
                    // date object
                    countMovementDate[newTimestampDate] = 1;
                    countCheckInDate[newTimestampDate] = 0;
                }
                // count[data[i].Timestamp] = 1;
            } else {
                if (data[i].type == "check-in") {
                    countCheckIn[newTimestamp] += 1;
                    countCheckInDate[newTimestampDate] += 1;
                } else {
                    countMovement[newTimestamp] += 1;
                    countMovementDate[newTimestampDate] += 1;
                }
                // count[data[i].Timestamp] += 1;
            }
            unique[newTimestamp] = 0;
        }


        var objCount = {
            // rating: [],
            "name" : "Check-in"
        };
        var objMovement = {
            // rating: [],
            "name" : "Movement"
        };


        // add ratings to objects
        objCount["rating"] = countCheckIn;
        objMovement["rating"] = countMovement;

        // timestamp ratings to objects
        objCount["ratingDate"] = countCheckInDate;
        objMovement["ratingDate"] = countMovementDate;

        var likertData = [objCount, objMovement];

        // console.log("likertData");
        // console.log(likertData);
        return likertData;
    }
}
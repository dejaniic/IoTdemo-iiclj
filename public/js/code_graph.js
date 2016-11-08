$(document).ready(function() {
    var sensor_id = getUrlParameter("sensor_id");
    $("#sensor-id").text(sensor_id);

    // draw chart
    var line_colors = ["#F04D52", "#30B9B3", "#FBD900"];
    var max_data = 10; // maximum number of data to display

    var ctx = $("#chart");

    var data = {
        labels: [],
        datasets: []
    };

    var line_chart = new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            animation: {
                duration: 300
            }
        }
    });

	if(!("WebSocket" in window)){
		console.log("Client does not support WebSockets ...");
	} else {
        // connect to websocket
    	connect();

        function connect() {
            try {

            	var socket;
            	var host = "ws://iicljiotdemo.mybluemix.net/websocket";
                var socket = new WebSocket(host);

                console.log('Socket Status: '+socket.readyState);

                socket.onopen = function() {
               		 console.log('Socket status: Open');
                }

                socket.onmessage = process_message;

                socket.onclose = function() {
               		 console.log('Socket status: Closed');
                     setTimeout(connect, 3000); // reconnect in 3 seconds
                }

            } catch(exception) {
           		 console.log(exception);
                 setTimeout(connect, 3000); // reconnect in 3 seconds
            }
        }

        function process_message(msg) {
            var sensor_data = JSON.parse(msg.data);
            if(sensor_data.ID === sensor_id) {
                // add label
                var d = new Date(sensor_data.timestamp);
                var time_string = d.getHours() + ":" + d.getMinutes() + ":" +
                    d.getSeconds() + "." + d.getMilliseconds();
                data.labels.push(time_string);
                // display only max_data labels
                data.labels = data.labels.splice(-max_data);

                // add data
                $.each(sensor_data, function(idx_sensor, el_sensor) {
                    if(idx_sensor !== "ID" && idx_sensor !== "timestamp") {
                        var dataset = null;
                        // find dataset
                        $.each(data.datasets, function(idx_dataset, el_dataset) {
                            if(el_dataset.label === idx_sensor) {
                                dataset = el_dataset;
                            }
                        });
                        // create dataset
                        if(dataset === null) {
                            dataset = {
                                label: idx_sensor,
                                data: [],
                                fill: false,
                                borderColor: line_colors.pop()
                            }
                            data.datasets.push(dataset);
                        }

                        // append data
                        dataset.data.push(el_sensor)
                        // display only max_data data
                        dataset.data = dataset.data.splice(-max_data);
                    }
                });

                // update graph
                line_chart.update();
            }
        }
    }
});

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
}

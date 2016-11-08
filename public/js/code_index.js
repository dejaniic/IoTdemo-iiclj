$(document).ready(function() {
	if(!("WebSocket" in window)){
		console.log("Client does not support WebSockets ...");
	} else {
		// hide hexagon text at start
		$(".hex-text").hide();

		// set hexagon positions
		var hex_positions = [["4%", "12%"], ["16%", "42%"], ["9%", "76%"], ["54%", "26%"], ["67%", "48%"], ["59%", "73%"]];
		$(".hex-container").css("top", function(idx) {
			return hex_positions[idx][0];
		});
		$(".hex-container").css("left", function(idx) {
			return hex_positions[idx][1];
		});

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
			if(typeof sensor_data.ID === "string" &&
			   sensor_data.ID.startsWith("FF-")) {
				// set data
				$("#" + sensor_data.ID + " .data-id").text(sensor_data.ID);
				var i = 1;
				for(k in sensor_data) {
					if(k !== "ID" && k !== "timestamp") {
						$("#" + sensor_data.ID + " .data-t" + i).text(k);
						$("#" + sensor_data.ID + " .data-v" + i).text(sensor_data[k]);
						i++;
					}
				}
				// show data
				$("#" + sensor_data.ID).fadeIn();
			}
        }
    }
});

function display_graph(el) {
	document.location.href = "graph.html?sensor_id=" + $(el).find(".hex-text").attr("id");
}

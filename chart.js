var laneHeight = 40;
var laneGap = laneHeight + 5;

var width = 800;
var height = 800;


var container = d3.select(".gantt-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("padding",40);


d3.json("lanes.json", function (error, lane_data) {
    addLane(lane_data);
});

d3.json("tasks.json", function (error, task_data) {
    addTask(task_data);
});


function addLane(source){
    var laneContainer = container.append("g");

    var lane = laneContainer.selectAll("rect")
        .data(source)
        .enter()
        .append("rect");

    var lane_attrs = lane
        .attr("x", 0)
        .attr("y", function (d, i) {
            return 5 + i * laneGap;
        })
        .attr("width", width-40)
        .attr("height", laneHeight)
        .style("stroke","black")
        .style("fill","white");
}

function addTask(source){
    var taskContainer = container.append("g");

    var task = taskContainer.selectAll("rect")
        .data(source)
        .enter()
        .append("rect");

    var task_attrs = task
        .attr("x", function(d){return d.startDate;})
        .attr("y", function (d) {
            return 5 + d.lane*laneGap;
        })
        .attr("width", function(d){return d.length;})
        .attr("height", laneHeight)
        .style("fill","blue");
}




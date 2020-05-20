/**
 * CONSTANTS AND GLOBALS
 * */
var
	height = document.documentElement.clientHeight * 0.75,
  width = height,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;
let root, pack, tr;

/**
 * APPLICATION STATE
 * */
let state = {
  data: null,
  hover: null,
  mousePosition: null
};

const timeConv = d3.timeParse("%d/%m/%Y");
var formatTime = d3.timeFormat("%B %d, %Y");
/**
 * LOAD DATA
 * */
//d3.json("response_1589923719384.json").then(data => {
d3.json("https://disease.sh/v2/countries").then(data => {
//console.log(data);
	state.data = d3.nest()
		.key(function(d) { return d.country })
  	.rollup(function(v) {
  		return {
  			geoid: v[0].countryInfo["iso2"],
  			area: v[0].continent,
  			lastDate: v[0].updated,
  			population: v[0].population,
  			cases: v[0].cases,//d3.sum(v, function(d) { return d.cases }),,
  			deaths: v[0].deaths,//d3.sum(v, function(d) { return d.deaths })
  			tests: v[0].tests
  		}
  	})
		.entries(data);
//console.log(state.data);

	const lastDate = d3.max(state.data, function(d,i) { return formatTime(d.value.lastDate); });
	document.getElementById("lastdate").innerHTML = lastDate;

  init();
});

/**
 * INITIALIZING FUNCTION
 * this will be run *one time* when the data finishes loading in
 * */
function init() {
//	console.log(lastDate);
  const container = d3.select("#d3-container")
  	.style("position", "relative")
  	.style("width", width+"px")
  	.style("height", height+"px")
  	.style("margin-left", "5%")
  	.style("float", "left");
//  	.style("margin", "0 auto");

  tooltip = container
    .append("div")
    .attr("class", "tooltip")
    .attr("width", 100)
    .attr("height", 100)
    .style("position", "absolute");

  svg = container
    .append("svg")
    .attr("viewBox", "0 0 "+ width + " " + height)
    .attr("id", "svgContainer");

  const uniqueAreas = [...new Set(state.data.map(d => d.value.area))];
  //console.log(uniqueAreas);
  const colorScale = d3
    .scaleOrdinal()
    .domain(uniqueAreas)
    .range(["#4e79a7","#f28e2c","#e15759","#76b7b2","#59a14f","#edc949","#af7aa1","#ff9da7","#9c755f","#bab0ab"]); //Tableau10

  const rolledUp = d3.rollups(
    state.data,
    v => ({ countCases: d3.sum(v, v => v.value.cases), countDeaths: d3.sum(v, v => v.value.deaths), country: v }), // reduce function,
    d => d.value.area,
    d => d.key
  );

  //console.log("rolledUp", rolledUp);

  // make hierarchy
  root = d3
    .hierarchy([null, rolledUp], ([key, values]) => values) // children accessor, tell it to grab the second element
    .sum(([key, values]) => values.countCases) // sets the 'value' of each level
    .sort((a, b) => b.value - a.value);

  // make treemap layout generator
  pack = d3
    .pack()
    .size([width, height]);

  // call our generator on our root hierarchy node
  pack(root); // creates our coordinates and dimensions based on the heirarchy and tiling algorithm
//console.log(root);
  // create g for each leaf
  const circle0 = svg
  	.append("circle")
  	.attr("cx", width/2)
  	.attr("cy", height/2)
  	.attr("r", width/2)
  	.attr("fill", "rgba(0,0,0,0.2)");

  const leaf = svg
    .selectAll("g")
    .data(root.leaves())/*/, function(d) {
    	return d.value.geoid;
    })*/
    .join("g")
    .attr("class", "node");

  leaf
    .append("circle")
    .attr("stroke", "rgba(0,0,0,0.2)")
    .attr("fill", d => colorScale(d.data[1].country[0].value.area) )
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.r; })
    .on("mouseover", function(d) {
			d3.select(this).style("fill", function() {
        return d3.rgb(d3.select(this).style("fill")).darker(0.3);
    	});
      state.hover = {
        translate: [
          // center top left corner of the tooltip in center of tile
          d.x,
          d.y
        ],
        name: d.data[1].country[0].key.replace(/_/g, " "),
        cases: d.data[1].countCases,
        deaths: d.data[1].countDeaths
      };
      draw();
    })
    .on("mouseout", function(d) {
			d3.select(this).style("fill", d => colorScale(d.data[1].country[0].value.area));
    });

  var columns = ["cases","deaths", "ratio"];

  d3.selectAll("thead td").data(columns.slice(0,2)).on("click", function(k) {
    tr.sort(function(a, b) { return (b.value[k] - a.value[k]); });
  });

	tr = d3.select("tbody").selectAll("tr")
    .data(state.data)
    .enter().append("tr");

  tr.append("th")
      .text(function(d) { return d.key; });

  tr.selectAll("td")
    .data(function(d) { return columns.map(function(k) {
		  	switch (k) {
		  		case "cases":
		  		case "deaths":
		  			return d.value[k];
		  			break;
		  		case "ratio":
		  			return (d.value["deaths"]/d.value["cases"] * 100).toFixed(2);
		  			break;
		  	}
    	});
  	})
    .enter().append("td")
    .text(function(d) { return d; });

  draw(); // calls the draw function
}

function update(tablekey) {

  var node = svg.selectAll(".node")
    .data(root.leaves());

  node.enter().append("g")
    .classed("node", true)
//    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
	  .append("circle")
    .attr("r", 0)
    .transition()
    .duration(2000)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.r; });

  node.transition()
    .duration(2000);

  node.select("circle")
    .transition()
    .duration(2000)
    .attr("cx", function(d) { return d.x; })
    .attr("cy", function(d) { return d.y; })
    .attr("r", function(d) { return d.r; });

  tr.sort(function(a, b) { return (b.value[tablekey] - a.value[tablekey]); });

}
/**
 * DRAW FUNCTION
 * we call this everytime there is an update to the data/state
 * */
function draw() {
  if (state.hover) {
    tooltip
      .html(
        `
        <div><span class="bold">Country:</span> ${state.hover.name}</div>
        <div><span class="bold">Cases:</span> ${state.hover.cases}</div>
        <div><span class="bold">Deaths:</span> ${state.hover.deaths}</div>
      `
      )
      .transition()
      .duration(500)
      .style(
        "transform",
        `translate(${state.hover.translate[0]}px,${state.hover.translate[1]}px)`
      );
  }
}

	d3.selectAll(".switch").on("change", function() {
		var toUpdate;
		if (d3.select("#rCases").property("checked")) {
			root.sum(([key, values]) => values.countCases);
			toUpdate = "cases";
		}
		else {
			root.sum(([key, values]) => values.countDeaths);
			toUpdate = "deaths";
		}
		pack(root);
		update(toUpdate);
	});


function resize() {
	height = document.documentElement.clientHeight * 0.75; 
	width = height;
  d3.select("#d3-container")
  	.style("width", width+"px")
  	.style("height", height+"px");
}

window.onresize = function () {
	resize();
}

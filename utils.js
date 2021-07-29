
async function init(file, color) {
    data = await d3.csv(file)

    populateCountry(data)

    initializeChart(data, "US", color)
}

function populateCountry(data) {
    let options = [...new Set(data.map(d => d.country))];
    // add the options to the button
    d3.select("#country")
        .selectAll('myOptions')
        .data(options)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text in the menu
        .attr("value", function (d) { return d; }) // corresponding value by the action
}

function updateChart(lineChartComp, line, data, selectedCountry) {

    countryData = data.filter(function(d) { return d.country == selectedCountry;})

    let cases = [...countryData.map(d => d.cases)];

    lineChartComp.transition()
        .duration(1000)
        .attr("d", line(cases));
}

function initializeChart(data, selectedCountry, lineColor) {

    countryData = data.filter(function(d) { return d.country == selectedCountry;})

    // CONSTRUCT GRAPH CONTAINER
    const margin = { top: 80, right: 150, bottom: 60, left: 100 };
    const width = 1000 - margin.left - margin.right;
    const height = 800 - margin.top - margin.bottom;

    let svg = d3
        .select("#container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // CONSTRUCT AXES

    const dateParser = d3.timeParse("%Y-%m-%d");

    let dates = [...countryData.map(d => dateParser(d.date))];
    let cases = [...countryData.map(d => d.cases)];

    const xScale = d3
        .scaleTime()
        .domain(d3.extent(dates, (d) => d))
        .range([0, width]);

    svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    const yScale = d3
        .scaleLinear()
        .domain([0, d3.max(cases)])
        .nice()
        .range([height, 0]);

    svg.append("g").call(d3.axisLeft(yScale));

    svg
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -75)
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("# Cases")
        .style("font-family", "Lato")
        .style("font-size", "14px");

    // LINE GRAPH

    let line = d3
        .line()
        .x((d, i) => xScale(dates[i]))
        .y((d) => yScale(d));

    lineChartComp = svg.append("g")
        .append("path")
        .attr("fill", "none")
        .attr("stroke", lineColor)
        .attr("stroke-width", 2)
        .attr("class", "line")
        .attr("d", line(cases));

    // When the button is changed, run the updateChart function
    d3.select("#country").on("change", function(d) {
        // recover the option that has been chosen
        var selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        updateChart(lineChartComp, line, data, selectedOption)
    })
}

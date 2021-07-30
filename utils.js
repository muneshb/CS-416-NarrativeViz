
async function init(file, color) {
    data = await d3.csv(file)

    populateCountry(data)

    initializeChart(data, "US", color)
}

function populateCountry(data) {
    let options = [...new Set(data.map(d => d.country))];

    let topCountries = ["US", "India", "Canada", "Mexico", "United Kingdom", "Brazil", "France", "Russia", "Italy", "Argentina"]

    options = options.filter(item => !topCountries.includes(item))

    options.unshift(...topCountries)

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
    const width = 900 - margin.left - margin.right;
    const height = 700 - margin.top - margin.bottom;

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

    // Tooltip
    var mouseG = svg.append("g").attr("class", "mouse-over-effects");

    mouseG
        .append("path") // this is the black vertical line to follow mouse
        .attr("class", "mouse-line")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    var lines = document.getElementsByClassName("line");

    var mousePerLine = mouseG
        .selectAll(".mouse-per-line")
        .data(countryData)
        .enter()
        .append("g")
        .attr("class", "mouse-per-line");

    mousePerLine
        .append("circle")
        .attr("r", 7)
        .style("stroke", lineColor)
        .style("fill", "none")
        .style("stroke-width", "1px")
        .style("opacity", "0");

    mousePerLine.append("text").attr("transform", "translate(10,3)");

    mouseG
        .append("svg:rect") // append a rect to catch mouse movements on canvas
        .attr("width", width) // can't catch mouse events on a g element
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .on("mouseout", function () {
            // on mouse out hide line, circles and text
            d3.select(".mouse-line").style("opacity", "0");
            d3.selectAll(".mouse-per-line circle").style("opacity", "0");
            d3.selectAll(".mouse-per-line text").style("opacity", "0");
        })
        .on("mouseover", function () {
            // on mouse in show line, circles and text
            d3.select(".mouse-line").style("opacity", "1");
            d3.selectAll(".mouse-per-line circle").style("opacity", "1");
            d3.selectAll(".mouse-per-line text").style("opacity", "1");
        })
        .on("mousemove", function () {
            // mouse moving over canvas
            var mouse = d3.mouse(this);
            d3.select(".mouse-line").attr("d", function () {
                var d = "M" + mouse[0] + "," + height;
                d += " " + mouse[0] + "," + 0;
                return d;
            });

            d3.selectAll(".mouse-per-line").attr("transform", function (d, i) {

                var xDate = xScale.invert(mouse[0]),
                    bisect = d3.bisector(function (d) {
                        return d.date;
                    }).right;
                idx = bisect(d.cases, xDate);

                beginning = 0,
                    end = lines[0].getTotalLength(),
                    target = null;

                while (true) {
                    target = Math.floor((beginning + end) / 2);
                    pos = lines[0].getPointAtLength(target);
                    if (
                        (target === end || target === beginning) &&
                        pos.x !== mouse[0]
                    ) {
                        break;
                    }
                    if (pos.x > mouse[0]) end = target;
                    else if (pos.x < mouse[0]) beginning = target;
                    else break; //position found
                }

                d3.select(this)
                    .select("text")
                    .text(yScale.invert(pos.y).toFixed(0))
                    .style("font-size", "12px");

                return "translate(" + mouse[0] + "," + pos.y + ")";
            });
        });
}

function populateCasesByState(d) {
  if (d.state === "Illinois") {
    ilCases.push(+d.cases);
    dates.add(dateParser(d.date));
  }
  if (d.state === "New York") {
    nyCases.push(+d.cases);
  }
  if (d.state === "California") {
    caliCases.push(+d.cases);
  }
}

function zeroPadArrays(caliCases, nyCases) {
  caliCases.unshift(0);
  for (let i = 0; i < 191 - 154; i++) {
    nyCases.unshift(0);
  }
}

async function init(file) {
    data = await d3.csv(file)

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

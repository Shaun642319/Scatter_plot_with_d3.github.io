const req = new XMLHttpRequest();
const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
let data = [];
let timeArray;
let yearArray;

let xAxisScale;
let yAxisScale;

const width = 950;
const height = 400;
const padding = 40;

const svg = d3.select('svg');

const drawCanvas = () => {
  svg.attr('width', width)
     .attr('height', height)
}

const generateScale = () => {
  yearArray = data.map(d => {
    return new Date(d.Year, 0, 1)
  })
  
  xAxisScale = d3.scaleTime()
                 .domain([d3.min(yearArray, d => new Date(d.getFullYear() - 1, 0, 1)), d3.max(yearArray, d => new Date(d.getFullYear() + 1, 0, 1))])
                 .range([padding, width - padding])
  
  timeArray = data.map(d => {
    parsedTime = d.Time.split(':')
    return parseInt(parsedTime[0]) * 60 + parseInt(parsedTime[1]);
  })
  
  yAxisScale = d3.scaleLinear()
                 .domain([d3.min(timeArray), d3.max(timeArray)])
                 .range([padding, height - padding])
}

const drawDots = () => {
  const legend = svg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${width - 150}, ${padding})`);

  legend.append('rect')
      .attr('x', -21)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', 'red');

  legend.append('text')
      .attr('x', 9)
      .attr('y', 15)
      .text('No doping allegations');

  legend.append('rect')
      .attr('x', -21)
      .attr('y', 30)
      .attr('width', 20)
      .attr('height', 20)
      .style('fill', 'blue');

  legend.append('text')
      .attr('x', 9)
      .attr('y', 45)
      .text('Doping allegations');

  
  const tooltip = d3.select('#tooltip')
  
  svg.selectAll('circle')
     .data(data)
     .enter()
     .append('circle')
     .attr('cx', (d, i) => xAxisScale(yearArray[i]))
     .attr('cy', (d, i) => yAxisScale(timeArray[i]))
     .attr('r', 6)
     .attr('class', 'dot')
     .attr('data-xvalue', (d, i) => yearArray[i])
     .attr('data-yvalue', (d, i) => new Date(2004, 0, 1, 0, Math.floor(timeArray[i] / 60), timeArray[i] % 60))
     .style('fill', d => d.Doping == ""? 'red': 'blue')
     .on('mouseover', (event, d) => {
      tooltip.transition().duration(200).style('opacity', '0.8')
      tooltip.html(`${d.Name}: ${d.Nationality}<br>Year: ${d.Year} Time: ${d.Time} ${d.Doping !== ''? `<br><br>${d.Doping}`: ''}`)
             .style('left', `${event.pageX + 10}px`)
             .style('top', `${event.pageY - 28}px`)
             .attr('data-year', new Date(d.Year, 0, 1))
  })
  .on('mouseout', () => {
    tooltip.transition().duration(500).style('opacity', '0')
  })
}

const generateAxes = () => {
  const xAxis = d3.axisBottom(xAxisScale);
  
  svg.append('g')
     .call(xAxis)
     .attr('id','x-axis')
     .attr('transform', `translate(0, ${height - padding})`)
  
  const yAxis = d3.axisLeft(yAxisScale)
                  .tickFormat(d => {
                    const minutes = Math.floor(d / 60);
                    const seconds = d % 60;
                    return `${minutes}:${seconds < 10? '0': ''}${seconds}`
                  })
  
  svg.append('g')
     .call(yAxis)
     .attr('id', 'y-axis')
     .attr('transform', `translate(${padding}, 0)`)
}

req.open('GET', url, true)
req.onload = () => {
  data = JSON.parse(req.responseText);
  drawCanvas();
  generateScale();
  drawDots();
  generateAxes();
};
req.send()

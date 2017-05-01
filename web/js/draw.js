function drawBarGraph(svgName /* '#minorGraph svg' */, values, maxValue) {
    // init
    var graph = d3.select(svgName);
    graph.selectAll("*").remove();
    var top = 0;

    // visual properties
    var graphWidth = graph.node().getBoundingClientRect().width;
    var labelWidth = Math.min(130, Math.max(graphWidth/2, 100));
    var graphGroup = graph
        .selectAll('g')
        .data(values).enter()
        .append('g')
        .attr('class', 'major')
        .attr('transform', (d, i) => {top+=rowheight; return translate(1, i*rowheight);});
    graphGroup
        .append('rect')
            .attr('class', 'background')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', graphWidth-2)
            .attr('height', rowheight-1)
            .attr('stroke', 'black')
            .attr('stroke-width', 0)
            .attr('fill', '#f5f5f5')
            .append('title').text(d => 'Students ' + d.count + '\nDivision: ' + d.division);
    graphGroup
        .append('text')
            .style('font-size', 10)
            .attr('x', 2)
            .attr('y', 11)
            .attr('width', labelWidth)
            .text( d => {
                if(d.major.length > labelWidth/6)
                    return d.major.substring(0,labelWidth/6)+'…';
                else
                    return d.major;                       
            });
    graphGroup
        .append('rect')
            .attr('class', 'bar')//d => 'bar ' + d.division)
            .attr('x', labelWidth)
            .attr('y', 1.5)
            .attr('width', d => Math.ceil((graphWidth-labelWidth) * d.count/maxValue))
            .attr('height', rowheight-4)
            .attr('fill', d => colors[d.division]);
    // set height of graph
    graph.style('height', top);
}

function drawBarGraphDivision(svgName, values, maxValue) {
    // init
    var graph = d3.select(svgName);
    graph.selectAll("*").remove();
    var top = 0;

    // visual properties
    var graphWidth = graph.node().getBoundingClientRect().width;
    var labelWidth = Math.min(130, Math.max(graphWidth/2, 100));
    var graphGroup = graph
        .selectAll('g')
        .data(values).enter()
        .append('g')
        .attr('class', 'major')
        .attr('transform', (d, i) => {top+=rowheight; return translate(1, i*rowheight);});
    graphGroup
        .append('rect')
            .attr('class', 'background')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', graphWidth-2)
            .attr('height', rowheight-1)
            .attr('stroke', 'black')
            .attr('stroke-width', 0)
            .attr('fill', '#f5f5f5')
            .append('title').text(d => 'Students ' + d.count + '\nDivision: ' + d.division);
    graphGroup
        .append('text')
            .style('font-size', 10)
            .attr('x', 2)
            .attr('y', 11)
            .attr('width', labelWidth)
            .text( d => d.division );
    graphGroup
        .append('rect')
            .attr('class', 'bar')//d => 'bar ' + d.division)
            .attr('x', labelWidth)
            .attr('y', 1.5)
            .attr('width', d => Math.ceil((graphWidth-labelWidth) * d.count/maxValue))
            .attr('height', rowheight-4)
            .attr('fill', d => colors[d.division]);
    // set height of graph
    graph.style('height', top);
}
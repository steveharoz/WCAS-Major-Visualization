var wcasdata = [];
var currentYear = 2016;
var yearData = [];

// visual properties
var rowheight = 16;
var subdivisionSpacer = 10;

// colors
colors = {
    I: "#E41A1C", 
    II: "#377EB8", 
    III: "#4DAF4A",
    NA: "#888888"//"#984EA3"
}

d3.csv('wcas_data.csv', function(error, data){
    wcasdata = data;
    // get the range of available years
    var minYear = d3.min(wcasdata, o => o.year);
    var maxYear = currentYear = d3.max(wcasdata, o => o.year);
    d3.select('#yearSlider').attr('min', minYear);
    d3.select('#yearSlider').attr('max', maxYear);
    d3.select('#yearSlider').attr('value', maxYear);
    // initialize
    makeYearData();
    makeDivisionSubMajorGraph();
});

function makeYearData() {
    yearData = wcasdata.filter(o => +o.year == currentYear);
}

function translate(x, y) {
  return "translate(" + [x,y] + ")";
}

function makeDivisionSubMajorGraph() {
    var topdata = d3.nest()
        .key(function(d) { return d.division }).sortKeys(d3.ascending)
        .key(function(d) { return Math.floor(+d.subdivision) }).sortKeys(d3.ascending)
        .key(function(d) { return d.major }).sortKeys(d3.ascending)
        .entries(yearData);
    console.log(topdata);
    // drop division 4
    topdata = topdata.slice(0, topdata.length-1);

    for(var i=0; i<topdata.length; i++) {
        var divisionName = Array(i+2).join("I");
        var divisionGraph = d3.select('#' + divisionName);

        // reset
        divisionGraph.selectAll("*").remove();

        // visual properties
        var graphWidth = divisionGraph.node().getBoundingClientRect().width;
        var labelWidth = Math.min(130, Math.max(graphWidth/2, 100));
        var top = 20;

        // title
        var divisionTitleContainer = divisionGraph.append('g').attr('class', 'divisionTitleContainer');
        divisionTitleContainer.append('rect')
            .attr('width', '100%')
            .attr('height', 25)
            .attr('fill', 'transparent');
        var divisionMajors = d3.nest()
            .key(o => o.major)
            .entries(wcasdata.filter(o => o.division == divisionName))
            .map(o => o.key);
        divisionTitleContainer
            .datum( divisionMajors )
            .on('click', makeSelectionDetail);
        var divisionTitle = divisionTitleContainer.append('text')
            .attr('class', 'divisionTitle')
            .attr('y', 22)
            .style('font-size', 24);
        divisionTitle.append('tspan')
            .attr('class', 'mainTitle')
            .text('Division ' + divisionName);

        // division total student count
        var divStudentTotals = d3.nest()
            .key(function(d) { return d.division }).sortKeys(d3.ascending)
            .key(function(d) { return d.ID       })
            .rollup(o => o.ID)
            .map(yearData);
        divisionTitle.append('tspan')
            .text(' – ' + Object.keys(divStudentTotals['$'+divisionName]).length + ' students');
        
        // start graph
        var graph = divisionGraph.append('g')
            .attr('class', 'bargraph')
            .attr('transform', translate(0, 0))
            .attr('width', graphWidth)
            .attr('height', 200);
        // subdivision
        var subdivisionsData = topdata[i].values;
        var subdivisions = graph
            .selectAll('g')
            .data(subdivisionsData)
            .enter()
            .append('g')
            .attr('transform', (d, i) => {
                var y = top + subdivisionSpacer; 
                top += subdivisionSpacer + d.values.length*rowheight; 
                return translate(0, y);
            });
        // majors
        var majors = subdivisions
            .selectAll('g')
            .data(d => d.values).enter()
            .append('g')
            .attr('class', 'major')
            .attr('transform', (d, i) => {top+=rowheight; return translate(1, i*rowheight);});
        majors
            .append('rect')
                .attr('class', 'background')
                .attr('x', 0)
                .attr('y', 0)
                .attr('width', graphWidth-2)
                .attr('height', rowheight-1)
                .attr('stroke', 'black')
                .attr('stroke-width', 0)
                .attr('fill', '#f5f5f5')
                .on('click', makeMajorDetail)
                .append('title').text(d => 
                    'Majoring: ' + d.values.filter(o => o.type=="Major").length + '\n' +
                    'Minoring: ' + d.values.filter(o => o.type=="Minor").length + '\n');
        majors
            .append('text')
                .style('font-size', 10)
                .attr('x', 2)
                .attr('y', 11)
                //.attr('text-anchor', 'end')
                //.attr('x', labelWidth-5)
                .attr('width', labelWidth)
                .text( d => {
                    if(d.key.length > labelWidth/6)
                        return d.key.substring(0,labelWidth/6)+'…';
                    else
                        return d.key;                       
                });
        majors
            .append('rect')
                .attr('class', 'bar')
                .attr('x', labelWidth)
                .attr('y', 1.5)
                .attr('width', d => Math.ceil((graphWidth-labelWidth) * d.values.length/426))
                .attr('height', rowheight-4)
                .attr('fill', colors[divisionName]);
    }
}

var selected;
function makeMajorDetail(d, i) {
    selected = d;
    var major = d.key;
    d3.select('.bottomGraphs .row').style('display', 'table');
    d3.selectAll('.major .background, .divisionTitleContainer').classed('selected', false);
    try { d3.select(this).classed('selected',true); } catch (e) {}
    //update title
    d3.select('#topicTitle').text(major);
    //update major time graph
        //var timevalues = d3.nest();
        //timevalues = timevalues.key(function(o) { return o.year; }).sortKeys(d3.ascending);
        //timevalues = timevalues.rollup(o => new {"year": +o[0].year, "count": o.length});
        //timevalues = timevalues.entries(wcasdata);
            //.entries(wcasdata.filter(o => o.major == major))
            //.map(o => new {"year": +o.key})
        //console.log(timevalues);
        //timevalues.map(o => new {"year": +o[0].year, "count": o.length});
        //var majorOverTime = wcasdata.map(y => y.values.filter(o => o.major == major).length);
        //var maxInMajor = d3.max(majorOverTime);
    // major minor counts
        var majorData = yearData.filter(o => o.type == "Major" && o.major == major);
        var majorStudentsIDs = majorData.map(o => o.ID);
        var majorStudentData = yearData.filter(o => o.type == "Major" && majorStudentsIDs.includes(o.ID));
        // find single-major students
        var majorStudents = d3.nest()
            .key(o => o.ID)
            .map(majorStudentData)
            .values();
        var studentCount = majorStudents.length;
        var singleMajor = majorStudents.filter(o => o.length == 1).length;
        // minor
        var minorStudentData = yearData.filter(o => o.type == "Minor" && majorStudentsIDs.includes(o.ID));
        var studentsWithMinors = d3.nest()
            .key(o => o.ID)
            .map(minorStudentData);
        var noMinorCount = studentCount - studentsWithMinors.values().length;
        var maxSecondaryCount = studentCount - Math.min(singleMajor, noMinorCount);

             
    //update double majors
        d3.select('#singleMajorCount').text(singleMajor);
        d3.select('#singleMajorPercent').text(Math.round(100 * singleMajor / studentCount));
        // get other majors
        var otherMajors = d3.nest()
            .key(o => o.major)
            .rollup(o => {return {"count": o.length, "major": o[0].major, "division": o[0].division};})
            .map(majorStudentData)
            .values()
            .filter(o => o.major != major)
            .sort((a,b) => a.count - b.count).reverse();
        drawBarGraph('#doubleMajorGraph svg.majors', otherMajors, maxSecondaryCount);
        // get other majors' divisions
        var otherMajorsDivisions = d3.nest()
            .key(o => o.division)
            .rollup(o => {return {"count": o.length, "division": o[0].division};})
            .map(majorStudentData.filter(o => o.major != major))
            .values()
            .sort((a,b) => a.division < b.division ? -1 : 1);
        drawBarGraphDivision('#doubleMajorGraph svg.divisions', otherMajorsDivisions, maxSecondaryCount);

    //update minors
        d3.select('#noMinorCount').text(noMinorCount);
        d3.select('#noMinorPercent').text(Math.round(100 * noMinorCount / studentCount));
        var minorTopics = d3.nest()
            .key(o => o.major)
            .rollup(o => {return {"count": o.length, "major": o[0].major, "division": o[0].division};})
            .map(minorStudentData)
            .values()
            .sort((a,b) => a.count - b.count).reverse();
        drawBarGraph('#minorGraph svg.majors', minorTopics, maxSecondaryCount);
        // get minors' divisions
        var MinorDivisions = d3.nest()
            .key(o => o.division)
            .rollup(o => {return {"count": o.length, "division": o[0].division};})
            .map(minorStudentData)
            .values()
            .sort((a,b) => a.division < b.division ? -1 : 1);
        drawBarGraphDivision('#minorGraph svg.divisions', MinorDivisions, minorStudentData.length);
        
    //update minor time graph
    //update minor's majors graph
        var minorData = yearData.filter(o => o.type == "Minor" && o.major == major);
        var minorIDs = minorData.map(o => o.ID);
        minorData = yearData.filter(o => o.type == "Major" && minorIDs.includes(o.ID));
        // find major counts for students with minors
        minorData = d3.nest()
            .key(o => o.major)
            .rollup(o => { return {"count": o.length, "major": o[0].major, "division": o[0].division}; })
            .map(minorData)
            .values()
            .sort((a,b) => a.count - b.count).reverse();
        drawBarGraph('#minorsMajorGraph svg.majors', minorData, minorIDs.length);
        // find division for students with minors
        var DivisionsOfMajorIfMinoringInSubject = d3.nest()
            .key(o => o.division)
            .rollup(o => {return {"count": o.length, "division": o[0].division};})
            .map(minorData)
            .values()
            .sort((a,b) => a.division < b.division ? -1 : 1);
        drawBarGraphDivision('#minorsMajorGraph svg.divisions', DivisionsOfMajorIfMinoringInSubject, minorData.length);
}


function makeSelectionDetail(selectedMajors) {
    console.log("Selected majors:");
    console.log(selectedMajors);

    d3.select('.bottomGraphs .row').style('display', 'table');
    d3.selectAll('.major .background, .divisionTitleContainer').classed('selected', false);
    try { d3.select(this).classed('selected',true); } catch (e) {}

    //update title
    d3.select('#topicTitle').text("Division");

    //update major time graph

    // major minor counts
        var majorData = yearData.filter(o => o.type == "Major" && selectedMajors.includes(o.major));
        var majorStudentsIDs = majorData.map(o => o.ID);
        var majorStudentData = yearData.filter(o => o.type == "Major" && majorStudentsIDs.includes(o.ID));
        // find single-major students
        var majorStudents = d3.nest()
            .key(o => o.ID)
            .map(majorStudentData)
            .values();
        var studentCount = majorStudents.length;
        var singleMajor = majorStudents.filter(o => o.length == 1).length;
        // minor
        var minorStudentData = yearData.filter(o => o.type == "Minor" && majorStudentsIDs.includes(o.ID));
        var studentsWithMinors = d3.nest()
            .key(o => o.ID)
            .map(minorStudentData);
        var noMinorCount = studentCount - studentsWithMinors.values().length;
        var maxSecondaryCount = studentCount - Math.min(singleMajor, noMinorCount);

             
    //update double majors
        d3.select('#singleMajorCount').text(singleMajor);
        d3.select('#singleMajorPercent').text(Math.round(100 * singleMajor / studentCount));
        // get other majors
        var otherMajors = d3.nest()
            .key(o => o.major)
            .rollup(o => {return {"count": o.length, "major": o[0].major, "division": o[0].division};})
            .map(majorStudentData)
            .values()
            .filter(o => !(selectedMajors.includes(o.major)))
            .sort((a,b) => a.count - b.count).reverse();
        drawBarGraph('#doubleMajorGraph svg.majors', otherMajors, maxSecondaryCount);
        // get other majors' divisions
        var otherMajorsDivisions = d3.nest()
            .key(o => o.division)
            .rollup(o => {return {"count": o.length, "division": o[0].division};})
            .map(majorStudentData.filter(o => !(selectedMajors.includes(o.major))))
            .values()
            .sort((a,b) => a.division < b.division ? -1 : 1);
        drawBarGraphDivision('#doubleMajorGraph svg.divisions', otherMajorsDivisions, maxSecondaryCount);

    //update minors
        d3.select('#noMinorCount').text(noMinorCount);
        d3.select('#noMinorPercent').text(Math.round(100 * noMinorCount / studentCount));
        var minorTopics = d3.nest()
            .key(o => o.major)
            .rollup(o => {return {"count": o.length, "major": o[0].major, "division": o[0].division};})
            .map(minorStudentData)
            .values()
            .sort((a,b) => a.count - b.count).reverse();
        drawBarGraph('#minorGraph svg.majors', minorTopics, maxSecondaryCount);
        // get minors' divisions
        var MinorDivisions = d3.nest()
            .key(o => o.division)
            .rollup(o => {return {"count": o.length, "division": o[0].division};})
            .map(minorStudentData)
            .values()
            .sort((a,b) => a.division < b.division ? -1 : 1);
        drawBarGraphDivision('#minorGraph svg.divisions', MinorDivisions, minorStudentData.length);
        
    //update minor time graph
    //update minor's majors graph
        var minorData = yearData.filter(o => o.type == "Minor" && selectedMajors.includes(o.major));
        var minorIDs = minorData.map(o => o.ID);
        minorData = yearData.filter(o => o.type == "Major" && minorIDs.includes(o.ID));
        // find major counts for students with minors
        minorData = d3.nest()
            .key(o => o.major)
            .rollup(o => { return {"count": o.length, "major": o[0].major, "division": o[0].division}; })
            .map(minorData)
            .values()
            .sort((a,b) => a.count - b.count).reverse();
        drawBarGraph('#minorsMajorGraph svg.majors', minorData, minorIDs.length);
        // find division for students with minors
        var DivisionsOfMajorIfMinoringInSubject = d3.nest()
            .key(o => o.division)
            .rollup(o => {return {"count": o.length, "division": o[0].division};})
            .map(minorData)
            .values()
            .sort((a,b) => a.division < b.division ? -1 : 1);
        drawBarGraphDivision('#minorsMajorGraph svg.divisions', DivisionsOfMajorIfMinoringInSubject, minorData.length);
}
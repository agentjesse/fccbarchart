//use d3 v3 ordinal scale, rangeRoundBands(), rangeBand(), and axis to make vertical bar chart.
const margin = {top:40, right:30, bottom:25, left: 60};
const width  = 950 - margin.left - margin.right, 
			height = 600 - margin.top - margin.bottom;
//popup
const tooltip = d3.select('body').append('div')
										.attr('class','toolTip')//set important styling
										.style('position','absolute')
										.style('opacity','0');//start off hidden
//scales
const x = d3.scale.ordinal()
							.rangeRoundBands([0,width], 0);//this replaces .range. rangeRoundBands() will make the set of data(an array) from a continuous range for you... then sets it as scale range. padding between bars is the last argument
const y = d3.scale.linear()
						.range([height, 0]);//hi to lo for vertical graph due to coordinate system used by svg. low input = high output for y positon
//axes'
const xAxis = d3.svg.axis()//make the axis object using this line and set the appropriate scale and orientation
									.scale(x)
									.orient('bottom');
const yAxis = d3.svg.axis()
									.scale(y)
									.orient('left');
// set dims, make bkg, titles of graph
d3.select('.svgchart')
								.attr('width',width + margin.left + margin.right)
								.attr('height',height + margin.top + margin.bottom)
							.append('rect')
								.attr('class','chartBkg')
								.attr('width',width + margin.left + margin.right)
								.attr('height',height + margin.top + margin.bottom)
								.attr('rx','15')
								.attr('ry','15');
d3.select('.svgchart').append('text')
								.attr('class', 'chartTitle')
								.text('Gross Domestic Product - USA')
								.attr('x', 200)
								.attr('y', 50);
d3.select('.svgchart').append('text')
								.attr('class', 'yTitle')
								.text('$ (Billions)')
								.attr('x', 85)
								.attr('y', 330)
								.attr('transform', 'rotate(-90 85,330)');//rotation coords same as x and y position
//get the svg for the chart, set dimensions according to margins, append a group inside using the margin info									
const chart = d3.select('.svgchart')
							.append('g')//make a group within the svg to make use of margins from top left origin point of the group
								.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//retrieve the data from somewhere, make error checks, then use it to finish setting up scales before making the graph								
d3.json('https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/GDP-data.json', function(error,data){
	//error handling
	if(error)console.log(error);//super fucking important. display error if found!!
	console.log('data received:',data);
	//clean up data, no need for day of month
	data = data.data.map( item => [ item[0].split('').splice(0,7).join(''), item[1] ] );
	console.log('cleaned data:', data);
	//finish scale setup
	x.domain( data.map( function(d){ return d[0] }) );
	y.domain([ 0, d3.max(data, function(d){ return d[1] }) ]);
	//ordinal scale tick handling can't use axis.tick method... choose what ticks to display by making an array of discrete data. the corresponding ticks will then appear
	let ticks = data.filter( (item, i) => i%30 === 0)
									.map( item => { return item[0] } );
	// console.log(ticks);
	xAxis.tickValues(ticks);//this array can be made by filtering the data and setting in retrieval later
	//append axes' groups with the parts of an axis in them
	chart.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,'+height+')')
				.call(xAxis);
	chart.append('g')
				.attr('class', 'y axis')
				.call(yAxis);
	chart.selectAll('.tick text')//self made mod
				.attr('dy', '0.7em');
	//remember that at this point the chart variable is already the group you put into the svg. 
  chart.selectAll('rect')//initiate data join, in this case, the rect elements of this line don't exist yet...
        .data(data)//join the data. update selection is returned, it has enter selection hanging off it
			.enter().append('rect')//instantiate the 'g' elements for each item in the selection
				.attr('class', 'bar')
				.attr('x', function(d){ return x( d[0] ) })//x position determined from passing in the discrete data into the x ordinal scale
				.attr('y', function(d){ return y( d[1] ) })//scale is already reversed above to handle coordinate system
				.attr('height', function(d) { return height - y( d[1] ) })
				.attr('width', x.rangeBand() )//rangeBand() returns the bar width from the ordinal scale, made when rangeRoundBands was called

		//append d3 event handlers using on(). more info here: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#on	
		.on('mouseover', function(d,i){ //current datum and index
			// console.log(i);
			// console.log(d);
			// console.log(this);
			//display formatted tooltip div
			tooltip.html('<b>&#36;' + d[1] + ' Billion<br></b>' + d[0]  )
							//DON'T FORGET TO OFFSET THE POPUP OR IT WILL INTERFERE, causing multiple event firing
							.style('left', d3.event.pageX - 40 + 'px')//d3.event must be used to access the usual event object
							.style('top', d3.event.pageY - 95 + 'px');
			tooltip.transition()//smooth trnasition, from d3: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#transition
						.duration(700)//ms
						// .delay(300)//ms
						.style('opacity', 1);
			d3.select(this).style('opacity','0.5');
		})
		.on('mouseout', function(d,i){
			tooltip.style('opacity', 0)//reset opacity for next transition
							.style('top', '-100px');//throw off screen to prevent interference. just setting opact as it currently still may appear
			d3.select(this).style('opacity','1');
		});
	
});







//use d3 v3 ordinal scale, rangeRoundBands(), rangeBand(), and axis to make vertical bar chart.
const margin = {top:10, right: 0, bottom: 25, left: 45};
const width  = 650 - margin.left - margin.right, 
			height = 500 - margin.top - margin.bottom;
//popup
const tooltip = d3.select('body').append('div')
										.style('position','absolute')
										.style('background-color','#fff')
										.style('border-radius','10px')
										.style('padding','5px 10px')//no need to set width and height, just padding
										.style('opacity','0');//start off hidden
//scales
const x = d3.scale.ordinal()
							.rangeRoundBands([0,width], 0.1);//this replaces .range. rangeRoundBands() will make the set of data(an array) from a continuous range for you... then sets it as scale range. padding between bars is the last argument
const y = d3.scale.linear()
						.range([height, 0]);//hi to lo for vertical graph due to coordinate system used by svg. low input = high output for y positon
//axes'
const xAxis = d3.svg.axis()//make the axis object using this line and set the appropriate scale and orientation
									.scale(x)
									// .tickValues(['A','B','E','H','N', 'Z'])//this array can be made by filtering the data and setting in retrieval later
									.orient('bottom');
const yAxis = d3.svg.axis()
									.scale(y)
									.orient('left');
//get the svg for the chart, set dimensions according to margins, append a group inside using the margin info									
const chart = d3.select('.svgchart')
								.attr('width',width + margin.left + margin.right)
								.attr('height',height + margin.top + margin.bottom)
							.append('g')//make a group within the svg to make use of margins from top left origin point of the group
								.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
//retrieve the data from somewhere, make error checks, then use it to finish setting up scales before making the graph								
d3.tsv('/resources/data.tsv', typeConverter, function(error,data){
	//error handling
	if(error)console.log(error);//super fucking important. display error if found!!
	console.log(data);//this is a good check for null values
	//finish scale setup
	x.domain( data.map( function(d){ return d.letter }) );
	y.domain([ 0, d3.max(data, function(d){ return d.value; }) ]);
	//append axes' groups with the parts of an axis in them
	chart.append('g')
				.attr('class', 'x axis')
				.attr('transform', 'translate(0,'+height+')')
				.call(xAxis);
	chart.append('g')
				.attr('class', 'y axis')
				.call(yAxis);
	chart.selectAll('.tick text')//self made mod
				.attr('dy', '0.9em');
	//remember that at this point the chart variable is already the group you put into the svg. 
  chart.selectAll('rect')//initiate data join, in this case, the rect elements of this line don't exist yet...
        .data(data)//join the data. update selection is returned, it has enter selection hanging off it
			.enter().append('rect')//instantiate the 'g' elements for each item in the selection
				.attr('class', 'bar')
				.attr('x', function(d){ return x(d.letter) })
				.attr('y', function(d){ return y(d.value) })//scale is already reversed above to handle coordinate system
				.attr('height', function(d) { return height - y(d.value) })
				.attr('width', x.rangeBand() )//rangeBand() returns the bar width from the ordinal scale, made when rangeRoundBands was called

		//append d3 event handlers using on(). more info here: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#on	
		.on('mouseover', function(d,i){ //current datum and index
			// console.log(i);
			// console.log(d);
			// console.log(this);
			tooltip.html(d.value)
							//DON'T FORGET TO OFFSET THE POPUP OR IT WILL INTERFERE, causing multiple event firing
							.style('left', d3.event.pageX - 40 + 'px')//d3.event must be used to access the usual event object
							.style('top', d3.event.pageY - 45 + 'px');
			tooltip.transition()//smooth trnasition, from d3: https://github.com/d3/d3-3.x-api-reference/blob/master/Selections.md#transition
						.duration(700)//ms
						// .delay(300)//ms
						.style('opacity', 1);
			d3.select(this).style('opacity','0.5');
		})
		.on('mouseout', function(d,i){
			tooltip.style('opacity', 0)//reset opacity for next transition
							.style('top', '-50px');//throw off screen to prevent interference. just setting opact as it currently still may appear
			d3.select(this).style('opacity','1');
		});
	
});
function typeConverter(d) {
	// if (d.value === '42') return null;//throw away entry
  d.value = Number(d.value); // coerce to number
  return d;
}







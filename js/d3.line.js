function lineChart(param){

  var setting = {
    target: "body",
    width: 500,
    height: 300,
    margin_top: 30,
    margin_right: 30,
    margin_bottom: 30,
    margin_left: 30,
    legend_gap: 100,
    colors: d3.scale.category10() 
  };
  
  $.extend(setting, param);
  
  var chart = {};
  var _x, _y, svg, bodyG, line;
  var data = [];
  var legendLabels = [];
  var margins = {
      top: setting.margin_top, 
      left: setting.margin_left, 
      right: setting.margin_right, 
      bottom: setting.margin_bottom
  };
  
  chart.render = function () { // <-2A
      if (!svg) {
          svg = d3.select(setting.target)
                 .append("svg") // <-2B
                 .attr("class","svg")
                 .attr("height", setting.height)
                 .attr("width", setting.width);
          renderAxes(svg);
          defineBodyClip(svg);
          renderLegend(svg);
      }

      renderBody(svg);
  };

  function renderAxes(svg) {
    var axesG = svg.append("g")
                  .attr("class", "axes");

    renderXAxis(axesG);
    renderYAxis(axesG);
  }

  function renderXAxis(axesG){
    var xAxis = d3.svg.axis()
                     .scale(_x.range([0, quadrantWidth()]))
                     .orient("bottom"); 
    axesG.append("g")
        .attr("class", "x axis")
        .attr("transform", function () {
            return "translate(" + xStart() + "," + yStart() + ")";
        })
        .call(xAxis);
            
    d3.selectAll("g.x g.tick")
        .append("line")
        .classed("grid-line", true)
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", 0)
        .attr("y2", - quadrantHeight()); 
  }
  
  function renderYAxis(axesG){
      var yAxis = d3.svg.axis()
                       .scale(_y.range([quadrantHeight(), 0]))
                       .orient("left");
              
      axesG.append("g")
          .attr("class", "y axis")
          .attr("transform", function () {
              return "translate(" + xStart() + "," + yEnd() + ")";
          })
          .call(yAxis);
              
       d3.selectAll("g.y g.tick")
          .append("line")
          .classed("grid-line", true)
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", quadrantWidth())
          .attr("y2", 0);
  }

  function defineBodyClip(svg) { // <-2C
      var padding = 5;

      svg.append("defs")
        .append("clipPath")
        .attr("id", "body-clip")
        .append("rect")
        .attr("x", 0 - padding)
        .attr("y", 0)
        .attr("width", quadrantWidth() + 2 * padding)
        .attr("height", quadrantHeight());
  }

  function renderBody(svg) { // <-2D
      if (!bodyG)
          bodyG = svg.append("g")
                    .attr("class", "body")
                    .attr("transform", "translate(" 
                        + xStart() + "," 
                        + yEnd() + ")") // <-2E
                    .attr("clip-path", "url(#body-clip)");        

      renderLines();
      renderDots();
  }

  function renderLines() {
      line = d3.svg.line() //<-4A
                  .x(function (d) { return _x(d.x); })
                  .y(function (d) { return _y(d.y); });
                      
      bodyG.selectAll("path.line")
              .data(data)
              .enter() //<-4B
              .append("path")                
              .style("stroke", function (d, i) { 
                  return setting.colors(i); //<-4C
              })
              .attr("class", "line");

      bodyG.selectAll("path.line")
              .data(data)
              .transition() //<-4D
              .attr("d", function (d) { return line(d); });
  }

  function renderDots() {
      data.forEach(function (list, i) {
          bodyG.selectAll("circle._" + i) //<-4E
                  .data(list)
                  .enter()
                  .append("circle")
                  .attr("class", "dot _" + i);

          bodyG.selectAll("circle._" + i)
                  .data(list)                    
                  .style("stroke", function (d) { 
                      return setting.colors(i); //<-4F
                  })
                  .transition() //<-4G
                  .attr("cx", function (d) { return _x(d.x); })
                  .attr("cy", function (d) { return _y(d.y); })
                  .attr("r", 4.5);

          renderTooltip();
      });

  }

  function renderTooltip() {
      var tooltip = d3.select("body")
                         .append("div") 
                         .attr("class", "tooltip")       
                         .style("opacity", 0);

      data.forEach(function (list, i) {
          bodyG.selectAll("circle._" + i)
                  .on('mouseover' , function(d) {
                      d3.select(this).transition()
                                    .duration(200)
                                    .attr('r' , 7 )
                                    .style('fill' , '#188DF0' );
                      tooltip.transition()    
                                .duration(200)    
                                .style("opacity", .9);  
                      tooltip.html(d.x+"<br/>"+d.y)  
                                .style("left", (d3.event.pageX) + "px")   
                                .style("top", (d3.event.pageY - 40) + "px");
                      })
                  .on('mouseout' , function() {
                      d3.select(this).transition()
                                    .duration(200)
                                    .attr('r' , 4.5 )
                                    .style('fill' , '' );

                      tooltip.transition()    
                                .duration(500)    
                                .style("opacity", 0); 
                      });

      });
  }


  function renderLegend(svg) { // <-2D    
      var legendG = svg.selectAll(".legend")
                    .data(legendLabels)
                    .enter()
                    .append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate("+legendStart(i)+", 0)"; });

      legendG.append("rect")
        .style("fill", function(d, i) { return setting.colors(i); });

      legendG.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) { return d; });

  }

  function xStart() {
      return setting.margin_left;
  }

  function yStart() {
      return setting.height - setting.margin_bottom;
  }

  function xEnd() {
      return setting.width - setting.margin_right;
  }

  function yEnd() {
      return setting.margin_top;
  }

  function quadrantWidth() {
      return setting.width - setting.margin_left - setting.margin_right;
  }

  function quadrantHeight() {
      return setting.height - margins.top - margins.bottom;
  }

  function legendStart(i){
      var i = i || 0;

      return setting.margin_left + i * setting.legend_gap;
  }

  chart.width = function (w) {
      if (!arguments.length) return setting.width;
      width = w;
      return chart;
  };

  chart.height = function (h) { // <-1C
      if (!arguments.length) return setting.height;
      height = h;
      return chart;
  };

  chart.margins = function (m) {
      if (!arguments.length) return margins;
      margins = m;
      return chart;
  };

  chart.colors = function (c) {
      if (!arguments.length) return setting.colors;
      colors = c;
      return chart;
  };

  chart.x = function (x) {
      if (!arguments.length) return _x;
      _x = x;
      return chart;
  };

  chart.y = function (y) {
      if (!arguments.length) return _y;
      _y = y;
      return chart;
  };

  chart.addSeries = function (series) { // <-1D
      data.push(series);
      return chart;
  };

  chart.addLegendLabels = function (label) { // <-1D
      legendLabels.push(label);
      return chart;
  };


  return chart;

}
function barChart(param){

  var setting = {
    target: "body",
    width: 500,
    height: 300,
    margin_top: 30,
    margin_right: 30,
    margin_bottom: 30,
    margin_left: 30,
    colors: d3.scale.category10() 
  };
  
  $.extend(setting, param);
  
  var chart = {};
  var _x, _y, svg, bodyG;
  var data = [];
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

      renderBars();
  }

  function renderBars() {
      var padding = 2; // <-A
      
      bodyG.selectAll("rect.bar")
                  .data(data)
              .enter()
              .append("rect") // <-B
              .attr("class", "bar");

      bodyG.selectAll("rect.bar")
                  .data(data)                    
              .transition()
              .attr("x", function (d) { 
                  return _x(d.x); // <-C
              })
              .attr("y", function (d) { 
                  return _y(d.y); // <-D 
              })
              .attr("height", function (d) { 
                  return yStart() - _y(d.y); 
              })
              .attr("width", function(d){
                  return Math.floor(quadrantWidth() / data.length) - padding;
              });
              
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

  chart.setSeries = function (series) {
        data = series;
        return chart;
  };

  chart.tooltip = function(color){
    if (!arguments.length) color = setting.colors(0);
    var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) {
        return "<span style='color:" + color + "'>" + d.y + "</span>";
      });

    bodyG.call(tip);
    bodyG.selectAll(".bar")
          .on('mouseover', tip.show)
          .on('mouseout', tip.hide);
  }


  return chart;

}
function pieChart(param){

  var setting = {
    target: "body",
    width: 500,
    height: 500,
    margin_top: 30,
    margin_right: 30,
    margin_bottom: 30,
    margin_left: 30,
    radius: 200,
    innerRadius: 0,
    colors: d3.scale.category10() 
  };
  
  $.extend(setting, param);
  
  var chart = {};
  var svg, bodyG, pieG;
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
      }

      renderBody();
  };

  function renderBody() {
      if (!bodyG)
          bodyG = svg.append("g")
                  .attr("class", "body");

      renderPie();
      
  }

  function renderPie() {
      var pie = d3.layout.pie() // <-A
              .sort(function (d) {
                  return d.label;
              })
              .value(function (d) {
                  return d.value;
              });

      var arc = d3.svg.arc()
              .outerRadius(setting.radius)
              .innerRadius(setting.innerRadius);

      if (!pieG)
          pieG = bodyG.append("g")
                  .attr("class", "pie")
                  .attr("transform", function () {
                      return "translate(" + xStart() + "," + yStart() + ")";
                  })

      renderSlices(pie, arc);
      renderLabels(pie, arc);
  }

  function renderSlices(pie, arc) {
      var slices = pieG.selectAll("path.arc")
              .data(pie(data)); // <-B

      slices.enter()
              .append("path")
              .attr("class", "arc")
              .attr("fill", function (d, i) {
                  return setting.colors(i);
              });

      slices.transition()
              .attrTween("d", function (d) {
                  var currentArc = this.__current__; // <-C

                  if (!currentArc)
                      currentArc = {startAngle: 0, endAngle: 0};

                  var interpolate = d3.interpolate(currentArc, d);
                                      
                  this.__current__ = interpolate(1);//<-D
                  
                  return function (t) {
                      return arc(interpolate(t));
                  };
              });

      renderTooltip(slices);
  }

  function renderTooltip(slices) {
    var tooltip = d3.select("body")
              .append("div")
              .attr("class","tooltip")
              .style("opacity",0.0);
    
    slices.on("mouseover",function(d){
        tooltip.html(d.data.label + '<br/>' + d.value)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY + 20) + "px")
          .style("opacity",1.0);
      })
      .on("mousemove",function(d){     
        tooltip.style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY + 20) + "px");
      })
      .on("mouseout",function(d){        
        tooltip.style("opacity",0.0);
      });
  }

  function renderLabels(pie, arc) {
      var labels = pieG.selectAll("text.label")
              .data(pie(data)); // <-E

      labels.enter()
              .append("text")
              .attr("class", "label");

      labels.transition()
              .attr("transform", function (d) {
                  var x = arc.centroid(d)[0] * 1.4;               //文字的x坐标
                  var y = arc.centroid(d)[1] * 1.4;               //文字的y坐标
                  return "translate(" + x + "," + y + ")";
              })
              .attr("dy", ".35em")
              .attr("text-anchor", "middle")
              .text(function (d) {
                  return d.data.label;
              });

      renderLegend(pie);

  }

  function renderLegend(pie){
    var legendG = svg.selectAll(".legend")
          .data(legendLabels)
          .enter().append("g")
          .attr("transform", function(d,i){
            return "translate(" + (setting.width - setting.width/10) + "," + (i * 20 + 20) + ")";
          })
          .attr("class", "legend");   
        
        legendG.append("rect")
          .attr("width", 10)
          .attr("height", 10)
          .attr("fill", function(d, i) {
            return setting.colors(i);
          });
        legendG.append("text")
          .text(function(d){
            return d;
          })
          .style("font-size", 12)
          .attr("y", 13)
          .attr("x", 20);
  }

  
  function xStart() {
      return setting.margin_left + setting.radius;
  }

  function yStart() {
      return setting.margin_top  + setting.radius;
  }

  chart.width = function (w) {
      if (!arguments.length) return setting.width;
      setting.width = w;
      return chart;
  };

  chart.height = function (h) {
      if (!arguments.length) return setting.height;
      setting.height = h;
      return chart;
  };

  chart.colors = function (c) {
      if (!arguments.length) return setting.colors;
      setting.colors = c;
      return chart;
  };

  chart.radius = function (r) {
      if (!arguments.length) return setting.radius;
      setting.radius = r;
      return chart;
  };

  chart.innerRadius = function (r) {
      if (!arguments.length) return setting.innerRadius;
      setting.innerRadius = r;
      return chart;
  };

  chart.data = function (d) {
      if (!arguments.length) return data;
      data = d;
      return chart;
  };

  chart.addLegendLabels = function (label) { // <-1D
      legendLabels.push(label);
      return chart;
  };

  return chart;

}
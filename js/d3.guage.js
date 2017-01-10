function guageChart(param){

  var setting = {
    target: "body",
    width: 300,
    height: 200,
    margin_top: 30,
    margin_right: 30,
    margin_bottom: 30,
    margin_left: 30,
    colors: ['#e8e2ca','#3e6c0a'],
    ringInset: 20,
    ringWidth: 20,
    pointerWidth: 8,
    pointerTailLength: 5,
    pointerHeadLengthPercent: 0.8,   
    minValue: 0,
    maxValue: 100,  
    minAngle: -90,
    maxAngle: 90,   
    transitionMs: 750,
    majorTicks: 5,
    labelFormat: d3.format(',g'),
    labelInset: 10
  };
  
  $.extend(setting, param);
  
  var chart = {};
  var svg, bodyG, scale, centerTx, 
      range, pointer, radius,
      pointerHeadLength, arcColorFn;
  var data = [];
  var legendLabels = [];
  var margins = {
      top: setting.margin_top, 
      left: setting.margin_left, 
      right: setting.margin_right, 
      bottom: setting.margin_bottom
  };

  range = setting.maxAngle - setting.minAngle;
  radius = (setting.width - margins.left - margins.right) / 2;
  pointerHeadLength = Math.round(radius * setting.pointerHeadLengthPercent);
  arcColorFn = d3.interpolateHsl(d3.rgb(setting.colors[0]), d3.rgb(setting.colors[1]))
  // a linear scale that maps domain values to a percent from 0..1
  scale = d3.scale.linear()
                .range([0,1])
                .domain([setting.minValue, setting.maxValue]);    
  ticks = scale.ticks(setting.majorTicks);
  tickData = d3.range(setting.majorTicks).map(function() {return 1/setting.majorTicks;});
  centerTx = centerTranslation();
  
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

      renderGuage();
      
  }

  function renderGuage() {
      arc = d3.svg.arc()
                .innerRadius(radius - setting.ringWidth - setting.ringInset)
                .outerRadius(radius - setting.ringInset)
                .startAngle(function(d, i) {
                  var ratio = d * i;
                  return deg2rad(setting.minAngle + (ratio * range));
                })
                .endAngle(function(d, i) {
                  var ratio = d * (i+1);
                  return deg2rad(setting.minAngle + (ratio * range));
                });
      var arcs = bodyG.append('g')
                    .attr('class', 'arc')
                    .attr('transform', centerTx);
      
      arcs.selectAll('path')
        .data(tickData)
        .enter().append('path')
          .attr('fill', function(d, i) {
            return arcColorFn(d * i);
          })
          .attr('d', arc);

      var lg = bodyG.append('g')
                  .attr('class', 'label')
                  .attr('transform', centerTx);
      
      lg.selectAll('text')
          .data(ticks)
          .enter()
          .append('text')
          .attr('transform', function(d) {
            var ratio = scale(d);
            var newAngle = setting.minAngle + (ratio * range);
            return 'rotate(' +newAngle +') translate(0,' +(setting.labelInset - radius) +')';

          })
          .text(setting.labelFormat);   
       
      renderPoint();
  }

  function renderPoint(){
      var lineData = [ 
              [setting.pointerWidth / 2, 0], 
              [0, -pointerHeadLength],
              [-(setting.pointerWidth / 2), 0],
              [0, setting.pointerTailLength],
              [setting.pointerWidth / 2, 0] 
          ];
      var pointerLine = d3.svg.line().interpolate('monotone');
      var pg = bodyG.append('g').data([lineData])
          .attr('class', 'pointer')
          .attr('transform', centerTx);
          
      pointer = pg.append('path')
        .attr('d', pointerLine)
        .attr('transform', 'rotate(' +setting.minAngle +')');

      chart.update(data);        
  }

  function deg2rad(deg) {
    return deg * Math.PI / 180;
  }
  
  function centerTranslation() {
    return 'translate('+radius +','+ radius +')';
  }
  
  chart.update = function(data) {
      var ratio = scale(data);
      var newAngle = setting.minAngle + (ratio * range);
      pointer.transition()
        .duration(setting.transitionMs)
        .ease('elastic')
        .attr('transform', 'rotate(' +newAngle +')');
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

  chart.data = function (d) {
      if (!arguments.length) return data;
      data = d;
      return chart;
  };

  return chart;

}
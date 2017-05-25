function treeChart(param) {
    var setting = {
      target: "body",
      width: 1000,
      height: 600,
      margin_top: 30,
      margin_right: 30,
      margin_bottom: 30,
      margin_left: 120,
    };
    
    $.extend(setting, param);

    var chart = {};
    var margins = {
      top: setting.margin_top, 
      left: setting.margin_left, 
      right: setting.margin_right, 
      bottom: setting.margin_bottom
    };

    var svg, data, tree, diagonal, bodyG;
    var i = 0;
            

    chart.render = function () {
        if (!svg) {
            svg = d3.select("body").append("svg")
                    .attr("height", setting.height)
                    .attr("width", setting.width);
        }

        renderBody(svg);
    };

    function renderBody(svg) {
        if (!bodyG) {
            bodyG = svg.append("g")
				.attr("class", "body")
				.attr("transform", function (d) {
					return "translate(" + margins.left 
						+ "," + margins.top + ")";
				});
        }

        tree = d3.layout.tree()
                .size([
					(setting.height - margins.top - margins.bottom), 
					(setting.width - margins.left - margins.right)
				]);

        diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });

        data.x0 = (setting.height - margins.top - margins.bottom) / 2;
        data.y0 = 0;

        render(data);
    }

    function render(source) {
        var nodes = tree.nodes(data).reverse();

        renderdata(nodes, source);

        renderLinks(nodes, source);
    }

    function renderdata(data, source) {
        data.forEach(function (d) {
            d.y = d.depth * 250;
        });

        var node = bodyG.selectAll("g.node")
                .data(data, function (d) {
                    return d.id || (d.id = ++i);
                });

        var nodeEnter = node.enter().append("svg:g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + source.y0 
						+ "," + source.x0 + ")";
                })
                .on("click", function (d) {
                    toggle(d);
                    render(d);
                });

        nodeEnter.append("svg:circle")
                .attr("r", 1e-6)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

        var nodeUpdate = node.transition()
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

        nodeUpdate.select("circle")
                .attr("r", 4.5)
                .style("fill", function (d) {
                    return d._children ? "lightsteelblue" : "#fff";
                });

        var nodeExit = node.exit().transition()
                .attr("transform", function (d) {
                    return "translate(" + source.y 
						+ "," + source.x + ")";
                })
                .remove();

        nodeExit.select("circle")
                .attr("r", 1e-6);

        renderLabels(nodeEnter, nodeUpdate, nodeExit);

        data.forEach(function (d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    function renderLabels(nodeEnter, nodeUpdate, nodeExit) {
        nodeEnter.append("svg:text")
                .attr("x", function (d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    return d.name;
                })
                .style("fill-opacity", 1e-6);

        nodeUpdate.select("text")
                .style("fill-opacity", 1);

        nodeExit.select("text")
                .style("fill-opacity", 1e-6);
    }

    function renderLinks(data, source) {
        var link = bodyG.selectAll("path.link")
                .data(tree.links(data), function (d) {
                    return d.target.id;
                });

        link.enter().insert("svg:path", "g")
                .attr("class", "link")
                .attr("d", function (d) {
                    var o = {x: source.x0, y: source.y0};
                    return diagonal({source: o, target: o});
                });

        link.transition()
                .attr("d", diagonal);

        link.exit().transition()
                .attr("d", function (d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();
    }

    function toggle(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
    }

    function toggleAll(d) {
        if (d.children) {
            d.children.forEach(toggleAll);
            toggle(d);
        }
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

    chart.data = function (n) {
        if (!arguments.length) return data;
        data = n;
        return chart;
    };

    return chart;
}
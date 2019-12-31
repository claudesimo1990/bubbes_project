(function() {

    var margin = {top: 350, right: 480, bottom: 350, left: 480},
        radius = Math.min(margin.top, margin.right, margin.bottom, margin.left) - 50;

    var hue = d3.scale.category10();

    var luminance = d3.scale.sqrt()
        .domain([0, 10])
        .clamp(true)
        .range([90, 20]);

    var svg = d3.select("#partition").append("svg")
        .attr("width", margin.left + margin.right)
        .attr("height", margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var partition = d3.layout.partition()
        .sort(function(a, b) { return d3.ascending(a.name, b.name); })
        .size([2 * Math.PI, radius]);

    var arc = d3.svg.arc()
        .startAngle(function(d) { return d.x; })
        .endAngle(function(d) { return d.x + d.dx ; })
        .padAngle(.01)
        .padRadius(radius / 3)
        .innerRadius(function(d) { return radius / 3 * d.depth; })
        .outerRadius(function(d) { return radius / 3 * (d.depth + 1) - 1; });

    d3.json("data.json", function(error, root) {
        if (error) throw error;

        // Compute the initial layout on the entire tree to sum sizes.
        // Also compute the full name and fill color for each node,
        // and stash the children so they can be restored as we descend.
        partition
            .value(function(d) { return d.size; })
            .nodes(root)
            .forEach(function(d) {
                d._children = d.children;
                d.sum = d.value;
                d.key = key(d);
                d.fill = fill(d);
            });

        // Now redefine the value function to use the previously-computed sum.
        partition
            .children(function(d, depth) { return depth < 2 ? d._children : null; })
            .value(function(d) { return d.sum; });

        // if click on center: zoomOut
        var center = svg.append("circle")
            .attr("r", radius / 3)
            .on("click", zoomOut);
        // Add text when mouse is over the center
        center.append("title")
            .text("zoom out");

        var path = svg.selectAll("path")
            .data(partition.nodes(root).slice(1))
            .enter().append("path")
            .attr("d", arc)
            .style("fill", function(d) { return d.fill; })
            .each(function(d) { this._current = updateArc(d); })
            .on("click", zoomIn);

        // adding labels
        var text = svg.selectAll("text")
            .data(partition.nodes(root).slice(1))
            .enter().append("text")
            .style("font-size", "15px")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
            .attr("x", function(d) { return (d.x); })
            .attr("y", function(d) { return d.y+d.dy/2; })
            .attr("dx", "-4") // margin
            .attr("dy", ".15em") // vertical-align
            .text(function(d) { return d.name; })
            .on("click", zoomIn);

        function zoomIn(p) {
            if (p.depth > 1) p = p.parent;
            if (!p.children) return;
            zoom(p, p);
        }

        function zoomOut(p) {
            if (!p.parent) return;
            zoom(p.parent, p);
        }

        // Zoom to the specified new root.
        function zoom(root, p) {
            if (document.documentElement.__transition__) return;

            // Rescale outside angles to match the new layout.
            var enterArc,
                exitArc,
                outsideAngle = d3.scale.linear().domain([0, 2 * Math.PI]);

            function insideArc(d) {
                return p.key > d.key
                    ? {depth: d.depth - 1, x: 0, dx: 0} : p.key < d.key
                        ? {depth: d.depth - 1, x: 2 * Math.PI, dx: 0}
                        : {depth: 0, x: 0, dx: 2 * Math.PI};
            }

            function outsideArc(d) {
                return {depth: d.depth + 1, x: outsideAngle(d.x), dx: outsideAngle(d.x + d.dx) - outsideAngle(d.x)};
            }

            center.datum(root);

            // When zooming in, arcs enter from the outside and exit to the inside.
            // Entering outside arcs start from the old layout.
            if (root === p) enterArc = outsideArc, exitArc = insideArc, outsideAngle.range([p.x, p.x + p.dx]);

            // When zooming out, arcs enter from the inside and exit to the outside.
            // Exiting outside arcs transition to the new layout.
            if (root !== p) enterArc = insideArc, exitArc = outsideArc, outsideAngle.range([p.x, p.x + p.dx]);

            // update data
            path = path.data(partition.nodes(root).slice(1), function(d) { return d.key; });
            text = text.data(partition.nodes(root).slice(1), function(d) { return d.key; });

            d3.transition().duration(d3.event.altKey ? 7500 : 750).each(function() {
                path.exit().transition()
                    .style("fill-opacity", function(d) { return d.depth === 1 + (root === p) ? 1 : 0; })
                    .attrTween("d", function(d) { return arcTween.call(this, exitArc(d)); })
                    .remove()

                path.enter().append("path")
                    .style("fill-opacity", function(d) { return d.depth === 2 - (root === p) ? 1 : 0; })
                    .style("fill", function(d) { return d.fill; })
                    .on("click", zoomIn)
                    .each(function(d) { this._current = enterArc(d); });

                path.transition()
                    .style("fill-opacity", 1)
                    .attrTween("d", function(d) { return arcTween.call(this, updateArc(d)); });

                text.exit().transition()
                    .duration(d3.event.altKey ? 3750 : 375)
                    .style("opacity", 0)
                    .remove()

                text.enter().append("text")
                    .style("opacity", 1)
                    .on("click", zoomIn)

                text.transition()
                    .style("opacity", 0).duration(d3.event.altKey ? 3750 : 375)
                    .transition().duration(d3.event.altKey ? 3750 : 375)
                    .style("opacity", 1)
                    .style("font-size", "15px")
                    .attr("text-anchor", "middle")
                    .attr("transform", function(d) { return "rotate(" + computeTextRotation(d) + ")"; })
                    .attr("x", function(d) { return (d.x); })
                    .attr("y", function(d) { return d.y+d.dy/2; })
                    .attr("dx", "-4") // margin
                    .attr("dy", ".15em") // vertical-align
                    .text(function(d) { return d.name; })
                    .each(function(d) { this._current = updateText(d); })
            });

        }
    });

    function key(d) {
        var k = [], p = d;
        while (p.depth) k.push(p.name), p = p.parent;
        return k.reverse().join(".");
    }

    function fill(d) {
        var p = d;
        while (p.depth > 1) p = p.parent;
        var c = d3.lab(hue(p.name));
        c.l = luminance(d.sum);
        return c;
    }

    function arcTween(b) {
        var i = d3.interpolate(this._current, b);
        this._current = i(0);
        return function(t) {
            return arc(i(t));
        };
    }

    function updateArc(d) {
        return {depth: d.depth, x: d.x, dx: d.dx};
    }

    function updateText(d) {
        return {x: d.x, y: d.y, dy: d.dy, name: d.name};
    }

    function computeTextRotation(d) {
        return (d.x + d.dx / 2 - Math.PI)*180/Math.PI;
    }


    d3.select(self.frameElement).style("height", margin.top + margin.bottom + "px");

})();
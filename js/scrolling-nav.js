(function () {
    'use strict';

    const format = d3.format(",d");
    const width = 650;
    const radius = width / 6;

    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius * 1.5)
        .innerRadius(d => d.y0 * radius)
        .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1));

    const partition = data => {
        const root = d3.hierarchy(data)
            .sum(d => d.size)
            .sort((a, b) => b.value - a.value);
        return d3.partition()
            .size([2 * Math.PI, root.height + 1])
            (root);
    };

    const {require} = new observablehq.Library;

    d3.json("data2.json").then(data => {
        console.log(data);
        const root = partition(data);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        root.each(d => d.current = d);

        const svg = d3.select('#partition2SVG')
            .style("width", "100%")
            .style("height", "auto")
            .style("font", "10px sans-serif");

        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

        const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
                while (d.depth > 1)
                { d = d.parent; }
                return color(d.data.name);
            })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("d", d => arc(d.current));

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("dblclick", dblclick)
            .on("click", clicked);

        path.append("title")
            .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);

        const label = g.append("g")
            .attr("pointer-events", "none")
            .attr("text-anchor", "middle")
            .style("user-select", "none")
            .selectAll("text")
            .data(root.descendants().slice(1))
            .join("text")
            .attr("dy", "0.35em")
            .attr("fill-opacity", d => +labelVisible(d.current))
            .attr("transform", d => labelTransform(d.current))
            .text(d => d.data.name);

        var tapped = false
        const parent = g.append("circle")
            .datum(root)
            .attr("r", radius)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .on("click", function (a) {
                let top = document.getElementById("chart");
                let top2 = document.getElementById("chart2");

                let nested = document.getElementById("partitionSVG");
                let nested2 = document.getElementById("partition2SVG");
                // Throws Uncaught TypeError
                top.removeChild(nested);
                top.appendChild(nested2);

                top2.appendChild(nested);
                top2.removeChild(nested2);
            })
            .on("touchstart", function (e) {
                if (!tapped) { //if tap is not set, set up single tap
                    tapped = setTimeout(function () {
                        tapped = null;
                        let top = document.getElementById("chart");
                        let top2 = document.getElementById("chart2");

                        let nested = document.getElementById("partitionSVG");
                        let nested2 = document.getElementById("partition2SVG");
                        // Throws Uncaught TypeError
                        top.removeChild(nested);
                        top.appendChild(nested2);

                        top2.appendChild(nested);
                        top2.removeChild(nested2);
                        clicked();
                    }, 300);
                } else {
                    clearTimeout(tapped);
                    tapped = null
                    let top = document.getElementById("chart");
                    let top2 = document.getElementById("chart2");

                    let nested = document.getElementById("partitionSVG");
                    let nested2 = document.getElementById("partition2SVG");
                    // Throws Uncaught TypeError
                    top.removeChild(nested);
                    top.appendChild(nested2);

                    top2.appendChild(nested);
                    top2.removeChild(nested2);
                }
                e.preventDefault()
            });
        function clicked(p) {
            parent.datum(p.parent || root);

            root.each(d => d.target = {
                x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
                y0: Math.max(0, d.y0 - p.depth),
                y1: Math.max(0, d.y1 - p.depth)
            });

            const t = g.transition().duration(750);

            // Transition the data on all arcs, even the ones that aren’t visible,
            // so that if this transition is interrupted, entering arcs will start
            // the next transition from the desired position.
            path.transition(t)
                .tween("data", d => {
                    const i = d3.interpolate(d.current, d.target);
                    return t => d.current = i(t);
                })
                .filter(function (d) {
                    return +this.getAttribute("fill-opacity") || arcVisible(d.target);
                })
                .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
                .attrTween("d", d => () => arc(d.current));

            label.filter(function (d) {
                return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            }).transition(t)
                .attr("fill-opacity", d => +labelVisible(d.target))
                .attrTween("transform", d => () => labelTransform(d.current));
        }

        function arcVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
        }

        function labelVisible(d) {
            return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
        }

        function labelTransform(d) {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2 * radius;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        }
        function post_to_url(path, params, method) {
            method = method || "post"; // Set method to post by default, if not specified.

            // The rest of this code assumes you are not using a library.
            // It can be made less wordy if you use one.
            var form = document.createElement("form");
            form.setAttribute("method", method);
            form.setAttribute("action", path);

            var addField = function( key, value ){
                var hiddenField = document.createElement("input");
                hiddenField.setAttribute("type", "hidden");
                hiddenField.setAttribute("name", key);
                hiddenField.setAttribute("value", value );

                form.appendChild(hiddenField);
            };

            for(var key in params) {
                if(params.hasOwnProperty(key)) {
                    if( params[key] instanceof Array ){
                        for(var i = 0; i < params[key].length; i++){
                            addField( key, params[key][i] )
                        }
                    }
                    else{
                        addField( key, params[key] );
                    }
                }
            }

            document.body.appendChild(form);
            form.submit();
        }
        function touchclick(p) {
            clicked(p)
        }
        function cleanStringify(object) {
            if (object && typeof object === 'object') {
                object = copyWithoutCircularReferences([object], object);
            }
            return JSON.stringify(object);

            function copyWithoutCircularReferences(references, object) {
                var cleanObject = {};
                Object.keys(object).forEach(function(key) {
                    var value = object[key];
                    if (value && typeof value === 'object') {
                        if (references.indexOf(value) < 0) {
                            references.push(value);
                            cleanObject[key] = copyWithoutCircularReferences(references, value);
                            references.pop();
                        } else {
                            cleanObject[key] = '###_Circular_###';
                        }
                    } else if (typeof value !== 'function') {
                        cleanObject[key] = value;
                    }
                });
                return cleanObject;
            }
        }
        function dblclick(a) {
            var produkt = a.data.name;
           if(produkt == "Obst2") {
                clicked(a)
            }
            else {
                window.open("produkt.php?name=" + a.data.name, '_system')
            }
        }
    });

}());
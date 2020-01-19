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

    d3.json("circle-2.json").then(data => {
        console.log(data);
        const root = partition(data);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        root.each(d => d.current = d);

        const svg = d3.select('#circle-2')
            .style("width", "80%")
            .style("height", "auto")
            .style("z-index", "2")
            .style("font", "10px sans-serif");
        const g = svg.append("g")
            .attr("transform", `translate(${width / 2},${width / 2})`);

        const path = g.append("g")
            .selectAll("path")
            .data(root.descendants().slice(1))
            .join("path")
            .attr("fill", d => {
                while (d.depth > 1) {
                    d = d.parent;
                }
                return color(d.data.name);
            })
            .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("d", d => arc(d.current));

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("click", clicked);

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("dblclick", dblclick);

        var tapped = false
        path.filter(d => d.children)
            .on("touchstart", function (a) {
                if (!tapped) { //if tap is not set, set up single tap
                    tapped = setTimeout(function () {
                        tapped = null
                        var produkt = a.data.name;
                        if (produkt == "Obst2" || produkt == "Gemüse2" || produkt == "Tiefkühl2" ||
                            produkt == "Getränke2" || produkt == "Milchprodukte2" || produkt == "Süßwaren2") {
                            clicked(a)
                        } else {
                            window.open("produkt.php?name=" + a.data.name, '_system')
                        }
                    }, 300);
                } else {
                    clearTimeout(tapped);
                    tapped = null;
                    var produkt = a.data.name;
                    if (produkt == "Obst2" || produkt == "Gemüse2" || produkt == "Tiefkühl2" ||
                        produkt == "Getränke2" || produkt == "Milchprodukte2" || produkt == "Süßwaren2") {
                        clicked(a)
                    } else {
                        window.open("produkt.php?name=" + a.data.name, '_system')
                    }
                }
                e.preventDefault()
            });

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
                clicked(a);
                swapElements(document.getElementById("circle-2"),document.getElementById("circle-4"));
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

        function cleanStringify(object) {
            if (object && typeof object === 'object') {
                object = copyWithoutCircularReferences([object], object);
            }
            return JSON.stringify(object);

            function copyWithoutCircularReferences(references, object) {
                var cleanObject = {};
                Object.keys(object).forEach(function (key) {
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
        function swapElements(obj1, obj2) {
            // save the location of obj2
            var parent2 = obj2.parentNode;
            var next2 = obj2.nextSibling;
            // special case for obj1 is the next sibling of obj2
            if (next2 === obj1) {
                // just put obj1 before obj2
                parent2.insertBefore(obj1, obj2);
            } else {
                // insert obj2 right before obj1
                obj1.parentNode.insertBefore(obj2, obj1);

                // now insert obj1 where obj2 was
                if (next2) {
                    // if there was an element after obj2, then insert obj1 right before that
                    parent2.insertBefore(obj1, next2);
                } else {
                    // otherwise, just append as last child
                    parent2.appendChild(obj1);
                }
            }
        }

        function dblclick(a) {
            var produkt = a.data.name;
            if (produkt == "Obst2" || produkt == "Gemüse2" || produkt == "Tiefkühl2" ||
                produkt == "Getränke2" || produkt == "Milchprodukte2" || produkt == "Süßwaren2") {
                clicked(a)
            } else {
                window.open("produkt.php?name=" + a.data.name, '_system')
            }
        }
    });

}());
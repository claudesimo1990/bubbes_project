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

    d3.json("data.json").then(data => {
        console.log(data);
        const root = partition(data);
        const color = d3.scaleOrdinal(d3.schemeCategory10);

        root.each(d => d.current = d);

        const svg = d3.select('#partitionSVG')
            .style("width", "90%")
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
            .on("click", clicked);

        path.filter(d => d.children)
            .style("cursor", "pointer")
            .on("dblclick", dblclick);

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
        function dblclick(a){
            console.log(cleanStringify(a.data))
           var data = JSON.parse(cleanStringify(a.data.name));
            //post_to_url("produkt.php",{"name":data},"Post");
            window.open("produkt.php?name="+cleanStringify(a.data.name), '_blank')
        }
    });

}());

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzIjpbIi4uL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IGZvcm1hdCA9IGQzLmZvcm1hdChcIixkXCIpO1xuY29uc3Qgd2lkdGggPSA5MzI7XG5jb25zdCByYWRpdXMgPSB3aWR0aCAvIDY7XG5cbmNvbnN0IGFyYyA9IGQzLmFyYygpXG4gICAgICAgIC5zdGFydEFuZ2xlKGQgPT4gZC54MClcbiAgICAgICAgLmVuZEFuZ2xlKGQgPT4gZC54MSlcbiAgICAgICAgLnBhZEFuZ2xlKGQgPT4gTWF0aC5taW4oKGQueDEgLSBkLngwKSAvIDIsIDAuMDA1KSlcbiAgICAgICAgLnBhZFJhZGl1cyhyYWRpdXMgKiAxLjUpXG4gICAgICAgIC5pbm5lclJhZGl1cyhkID0+IGQueTAgKiByYWRpdXMpXG4gICAgICAgIC5vdXRlclJhZGl1cyhkID0+IE1hdGgubWF4KGQueTAgKiByYWRpdXMsIGQueTEgKiByYWRpdXMgLSAxKSk7XG5cbmNvbnN0IHBhcnRpdGlvbiA9IGRhdGEgPT4ge1xuICAgIGNvbnN0IHJvb3QgPSBkMy5oaWVyYXJjaHkoZGF0YSlcbiAgICAgICAgICAgIC5zdW0oZCA9PiBkLnNpemUpXG4gICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYi52YWx1ZSAtIGEudmFsdWUpO1xuICAgIHJldHVybiBkMy5wYXJ0aXRpb24oKVxuICAgICAgICAgICAgLnNpemUoWzIgKiBNYXRoLlBJLCByb290LmhlaWdodCArIDFdKVxuICAgICAgICAgICAgKHJvb3QpO1xufVxuXG5jb25zdCB7cmVxdWlyZX0gPSBuZXcgb2JzZXJ2YWJsZWhxLkxpYnJhcnk7XG5cbnJlcXVpcmUoKSgnQG9ic2VydmFibGVocS9mbGFyZScpLnRoZW4oZGF0YSA9PiB7XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgY29uc3Qgcm9vdCA9IHBhcnRpdGlvbihkYXRhKTtcbiAgICBjb25zdCBjb2xvciA9IGQzLnNjYWxlT3JkaW5hbCgpLnJhbmdlKGQzLnF1YW50aXplKGQzLmludGVycG9sYXRlUmFpbmJvdywgZGF0YS5jaGlsZHJlbi5sZW5ndGggKyAxKSk7XG5cbiAgICByb290LmVhY2goZCA9PiBkLmN1cnJlbnQgPSBkKTtcblxuICAgIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdCgnI3BhcnRpdGlvblNWRycpXG4gICAgICAgICAgICAuc3R5bGUoXCJ3aWR0aFwiLCBcIjEwMCVcIilcbiAgICAgICAgICAgIC5zdHlsZShcImhlaWdodFwiLCBcImF1dG9cIilcbiAgICAgICAgICAgIC5zdHlsZShcImZvbnRcIiwgXCIxMHB4IHNhbnMtc2VyaWZcIik7XG5cbiAgICBjb25zdCBnID0gc3ZnLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHt3aWR0aCAvIDJ9LCR7d2lkdGggLyAyfSlgKTtcblxuICAgIGNvbnN0IHBhdGggPSBnLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgIC5zZWxlY3RBbGwoXCJwYXRoXCIpXG4gICAgICAgICAgICAuZGF0YShyb290LmRlc2NlbmRhbnRzKCkuc2xpY2UoMSkpXG4gICAgICAgICAgICAuam9pbihcInBhdGhcIilcbiAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBkID0+IHtcbiAgICAgICAgICAgICAgICB3aGlsZSAoZC5kZXB0aCA+IDEpXG4gICAgICAgICAgICAgICAgICAgIGQgPSBkLnBhcmVudDtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29sb3IoZC5kYXRhLm5hbWUpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5hdHRyKFwiZmlsbC1vcGFjaXR5XCIsIGQgPT4gYXJjVmlzaWJsZShkLmN1cnJlbnQpID8gKGQuY2hpbGRyZW4gPyAwLjYgOiAwLjQpIDogMClcbiAgICAgICAgICAgIC5hdHRyKFwiZFwiLCBkID0+IGFyYyhkLmN1cnJlbnQpKTtcblxuICAgIHBhdGguZmlsdGVyKGQgPT4gZC5jaGlsZHJlbilcbiAgICAgICAgICAgIC5zdHlsZShcImN1cnNvclwiLCBcInBvaW50ZXJcIilcbiAgICAgICAgICAgIC5vbihcImNsaWNrXCIsIGNsaWNrZWQpO1xuXG4gICAgcGF0aC5hcHBlbmQoXCJ0aXRsZVwiKVxuICAgICAgICAgICAgLnRleHQoZCA9PiBgJHtkLmFuY2VzdG9ycygpLm1hcChkID0+IGQuZGF0YS5uYW1lKS5yZXZlcnNlKCkuam9pbihcIi9cIil9XFxuJHtmb3JtYXQoZC52YWx1ZSl9YCk7XG5cbiAgICBjb25zdCBsYWJlbCA9IGcuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJwb2ludGVyLWV2ZW50c1wiLCBcIm5vbmVcIilcbiAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIilcbiAgICAgICAgICAgIC5zdHlsZShcInVzZXItc2VsZWN0XCIsIFwibm9uZVwiKVxuICAgICAgICAgICAgLnNlbGVjdEFsbChcInRleHRcIilcbiAgICAgICAgICAgIC5kYXRhKHJvb3QuZGVzY2VuZGFudHMoKS5zbGljZSgxKSlcbiAgICAgICAgICAgIC5qb2luKFwidGV4dFwiKVxuICAgICAgICAgICAgLmF0dHIoXCJkeVwiLCBcIjAuMzVlbVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJmaWxsLW9wYWNpdHlcIiwgZCA9PiArbGFiZWxWaXNpYmxlKGQuY3VycmVudCkpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBkID0+IGxhYmVsVHJhbnNmb3JtKGQuY3VycmVudCkpXG4gICAgICAgICAgICAudGV4dChkID0+IGQuZGF0YS5uYW1lKTtcblxuICAgIGNvbnN0IHBhcmVudCA9IGcuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgICAuZGF0dW0ocm9vdClcbiAgICAgICAgICAgIC5hdHRyKFwiclwiLCByYWRpdXMpXG4gICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCJub25lXCIpXG4gICAgICAgICAgICAuYXR0cihcInBvaW50ZXItZXZlbnRzXCIsIFwiYWxsXCIpXG4gICAgICAgICAgICAub24oXCJjbGlja1wiLCBjbGlja2VkKTtcblxuICAgIGZ1bmN0aW9uIGNsaWNrZWQocCkge1xuICAgICAgICBwYXJlbnQuZGF0dW0ocC5wYXJlbnQgfHwgcm9vdCk7XG5cbiAgICAgICAgcm9vdC5lYWNoKGQgPT4gZC50YXJnZXQgPSB7XG4gICAgICAgICAgICAgICAgeDA6IE1hdGgubWF4KDAsIE1hdGgubWluKDEsIChkLngwIC0gcC54MCkgLyAocC54MSAtIHAueDApKSkgKiAyICogTWF0aC5QSSxcbiAgICAgICAgICAgICAgICB4MTogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgKGQueDEgLSBwLngwKSAvIChwLngxIC0gcC54MCkpKSAqIDIgKiBNYXRoLlBJLFxuICAgICAgICAgICAgICAgIHkwOiBNYXRoLm1heCgwLCBkLnkwIC0gcC5kZXB0aCksXG4gICAgICAgICAgICAgICAgeTE6IE1hdGgubWF4KDAsIGQueTEgLSBwLmRlcHRoKVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3QgdCA9IGcudHJhbnNpdGlvbigpLmR1cmF0aW9uKDc1MCk7XG5cbiAgICAgICAgLy8gVHJhbnNpdGlvbiB0aGUgZGF0YSBvbiBhbGwgYXJjcywgZXZlbiB0aGUgb25lcyB0aGF0IGFyZW7igJl0IHZpc2libGUsXG4gICAgICAgIC8vIHNvIHRoYXQgaWYgdGhpcyB0cmFuc2l0aW9uIGlzIGludGVycnVwdGVkLCBlbnRlcmluZyBhcmNzIHdpbGwgc3RhcnRcbiAgICAgICAgLy8gdGhlIG5leHQgdHJhbnNpdGlvbiBmcm9tIHRoZSBkZXNpcmVkIHBvc2l0aW9uLlxuICAgICAgICBwYXRoLnRyYW5zaXRpb24odClcbiAgICAgICAgICAgICAgICAudHdlZW4oXCJkYXRhXCIsIGQgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpID0gZDMuaW50ZXJwb2xhdGUoZC5jdXJyZW50LCBkLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0ID0+IGQuY3VycmVudCA9IGkodCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGZ1bmN0aW9uIChkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiArdGhpcy5nZXRBdHRyaWJ1dGUoXCJmaWxsLW9wYWNpdHlcIikgfHwgYXJjVmlzaWJsZShkLnRhcmdldCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuYXR0cihcImZpbGwtb3BhY2l0eVwiLCBkID0+IGFyY1Zpc2libGUoZC50YXJnZXQpID8gKGQuY2hpbGRyZW4gPyAwLjYgOiAwLjQpIDogMClcbiAgICAgICAgICAgICAgICAuYXR0clR3ZWVuKFwiZFwiLCBkID0+ICgpID0+IGFyYyhkLmN1cnJlbnQpKTtcblxuICAgICAgICBsYWJlbC5maWx0ZXIoZnVuY3Rpb24gKGQpIHtcbiAgICAgICAgICAgIHJldHVybiArdGhpcy5nZXRBdHRyaWJ1dGUoXCJmaWxsLW9wYWNpdHlcIikgfHwgbGFiZWxWaXNpYmxlKGQudGFyZ2V0KTtcbiAgICAgICAgfSkudHJhbnNpdGlvbih0KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbC1vcGFjaXR5XCIsIGQgPT4gK2xhYmVsVmlzaWJsZShkLnRhcmdldCkpXG4gICAgICAgICAgICAgICAgLmF0dHJUd2VlbihcInRyYW5zZm9ybVwiLCBkID0+ICgpID0+IGxhYmVsVHJhbnNmb3JtKGQuY3VycmVudCkpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFyY1Zpc2libGUoZCkge1xuICAgICAgICByZXR1cm4gZC55MSA8PSAzICYmIGQueTAgPj0gMSAmJiBkLngxID4gZC54MDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsYWJlbFZpc2libGUoZCkge1xuICAgICAgICByZXR1cm4gZC55MSA8PSAzICYmIGQueTAgPj0gMSAmJiAoZC55MSAtIGQueTApICogKGQueDEgLSBkLngwKSA+IDAuMDM7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gbGFiZWxUcmFuc2Zvcm0oZCkge1xuICAgICAgICBjb25zdCB4ID0gKGQueDAgKyBkLngxKSAvIDIgKiAxODAgLyBNYXRoLlBJO1xuICAgICAgICBjb25zdCB5ID0gKGQueTAgKyBkLnkxKSAvIDIgKiByYWRpdXM7XG4gICAgICAgIHJldHVybiBgcm90YXRlKCR7eCAtIDkwfSkgdHJhbnNsYXRlKCR7eX0sMCkgcm90YXRlKCR7eCA8IDE4MCA/IDAgOiAxODB9KWA7XG4gICAgfVxufSk7Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztJQUFBLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0IsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDO0lBQ2xCLE1BQU0sTUFBTSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUM7O0lBRXpCLE1BQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUU7YUFDWCxVQUFVLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLENBQUM7YUFDckIsUUFBUSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDO2FBQ25CLFFBQVEsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDakQsU0FBUyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7YUFDdkIsV0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsRUFBRSxHQUFHLE1BQU0sQ0FBQzthQUMvQixXQUFXLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7SUFFdEUsTUFBTSxTQUFTLEdBQUcsSUFBSSxJQUFJO1FBQ3RCLE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxTQUFTLENBQUMsSUFB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
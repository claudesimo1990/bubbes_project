var inputData =
    [{month: 1, type: "haribot", value: 25},
        {month: 2, type: "Category 1", value: 15},
        {month: 3, type: "Category 1", value: 27},
        {month: 4, type: "Category 1", value: 10},
        {month: 5, type: "Category 1", value: 54},
        {month: 6, type: "Category 1", value: 23},
        {month: 7, type: "Category 1", value: 31},
        {month: 8, type: "Category 1", value: 17},
        {month: 9, type: "Category 1", value: 8},
        {month: 10, type: "Category 1", value: 12},
        {month: 11, type: "Category 1", value: 32},
        {month: 12, type: "Category 1", value: 35},
        {month: 1, type: "Category 2", value: 19},
        {month: 2, type: "Category 2", value: 24},
        {month: 3, type: "Category 2", value: 27},
        {month: 4, type: "Category 2", value: 12},
        {month: 5, type: "Category 2", value: 19},
        {month: 6, type: "Category 2", value: 30},
        {month: 7, type: "Category 2", value: 31},
        {month: 8, type: "Category 2", value: 25},
        {month: 9, type: "Category 2", value: 20},
        {month: 10, type: "Category 2", value: 5},
        {month: 11, type: "Category 2", value: 21},
        {month: 12, type: "Category 2", value: 10},
        {month: 1, type: "Category 3", value: 19},
        {month: 2, type: "Category 3", value: 3},
        {month: 3, type: "Category 3", value: 32},
        {month: 4, type: "Category 3", value: 23},
        {month: 5, type: "Category 3", value: 9},
        {month: 6, type: "Category 3", value: 17},
        {month: 7, type: "Category 3", value: 25},
        {month: 8, type: "Category 3", value: 29},
        {month: 9, type: "Category 3", value: 32},
        {month: 10, type: "Category 3", value: 33},
        {month: 11, type: "Category 3", value: 19},
        {month: 12, type: "Category 3", value: 24},
        {month: 1, type: "Category 4", value: 12},
        {month: 2, type: "Category 4", value: 43},
        {month: 3, type: "Category 4", value: 12},
        {month: 4, type: "Category 4", value: 23},
        {month: 5, type: "Category 4", value: 14},
        {month: 6, type: "Category 4", value: 19},
        {month: 7, type: "Category 4", value: 22},
        {month: 8, type: "Category 4", value: 39},
        {month: 9, type: "Category 4", value: 22},
        {month: 10, type: "Category 4", value: 26},
        {month: 11, type: "Category 4", value: 31},
        {month: 12, type: "Category 4", value: 25},
        {month: 1, type: "Category 5", value: 12},
        {month: 2, type: "Category 5", value: 43},
        {month: 3, type: "Category 5", value: 12},
        {month: 4, type: "Category 5", value: 23},
        {month: 5, type: "Category 5", value: 14},
        {month: 6, type: "Category 5", value: 19},
        {month: 7, type: "Category 5", value: 22},
        {month: 8, type: "Category 5", value: 39},
        {month: 9, type: "Category 5", value: 22},
        {month: 10, type: "Category 5", value: 26},
        {month: 11, type: "Category 5", value: 31},
        {month: 12, type: "Category 5", value: 25},
        {month: 1, type: "Category 6", value: 12},
        {month: 2, type: "Category 6", value: 43},
        {month: 3, type: "Category 6", value: 12},
        {month: 4, type: "Category 6", value: 23},
        {month: 5, type: "Category 6", value: 14},
        {month: 6, type: "Category 6", value: 19},
        {month: 7, type: "Category 6", value: 22},
        {month: 8, type: "Category 6", value: 39},
        {month: 9, type: "Category 6", value: 22},
        {month: 10, type: "Category 6", value: 26},
        {month: 11, type: "Category 6", value: 31},
        {month: 12, type: "Category 6", value: 25},
    ];

var radial_labels = ["PG-1", "p1", "p2", "p3", "p4", "p5"];
var segment_labels = ['weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...', 'weiter...'];

loadCircularHeatMap(inputData, "#chart", radial_labels, segment_labels);
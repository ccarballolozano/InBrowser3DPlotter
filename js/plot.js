function plotScatter3D(data, xName, yName, zNameArray, groupName, plotConfig, containerId) {
    let traces = [];  // array to hold every data trace
    let colorList = Plotly.d3.scale.category10();  // default color list (one for each label)
    // Colorlist gives function style, i.e., colorList(k) gives the k-th color, an array is enough
    colorList = Array.apply(null, {length: 10}).map((val, idx) => colorList(idx));

    function getSymbolList() {
        // return a list of normal-style symbol. Ref: https://codepen.io/etpinard/pen/LLZGZV
        let isOpen = s => s.includes('-open');
        let isDot = s => s.includes('-dot');
        let isOpenDot = s => isOpen(s) && isDot(s);
        let isBase = s => !isOpen(s) && !isDot(s);
        let symbolList = Plotly.PlotSchema.get()
            .traces
            .scatter
            .attributes
            .marker
            .symbol
            .values
            .filter(s => typeof s === 'string');
        return symbolList.filter(isBase);
    }

    let symbolList = getSymbolList();

    function createDataTrace(x, y, z, name, color, symbol, plotConfig) {
        let trace = {
            x: x,
            y: y,
            z: z,
            name: name,
            type: 'scatter3d',
            mode: 'markers',
            marker: {
                color: color,
                symbol: symbol,
                size: plotConfig['markerSize'],
                line: {
                    color: 'rgb(0, 0, 0)',
                    width: plotConfig['markerLineWidth']
                },
            opacity: plotConfig['markerOpacity'],
            },

        };
        return trace;
    }

    // Create traces
    if (!groupName) {  // No need to group points by label
        for (let i = 0; i < zNameArray.length; i++) {
            traces.push(
                createDataTrace(
                    data.map((val) => val[xName]),
                    data.map((val) => val[yName]),
                    data.map((val) => val[zNameArray[i]]),
                    zNameArray[i],
                    colorList[0],
                    symbolList[i],
                    plotConfig
                )
            );
        }
    } else {  // If data has to be grouped
        let groupByUnique = data.map((val) => val[groupName])
            .filter((val, idx, arr) => arr.indexOf(val) === idx).sort();
        for (let i = 0; i < zNameArray.length; i++) {
            for (let j = 0; j < groupByUnique.length; j++) {
                let filteredData = data.filter((val) => val[groupName] === groupByUnique[j]);
                traces.push(
                    createDataTrace(
                        filteredData.map((val) => val[xName]),
                        filteredData.map((val) => val[yName]),
                        filteredData.map((val) => val[zNameArray[i]]),
                        zNameArray[i] + ' (' + groupName + '=' + groupByUnique[j] + ')',
                        colorList[j],
                        symbolList[i],
                        plotConfig
                    )
                );
            }
        }
    }
    let layout = {
        scene: {
            xaxis: {
                title: xName,
            },
            yaxis: {
                title: yName,
            }
        }
    };
    Plotly.newPlot(containerId, traces, layout, {responsive: true});
}
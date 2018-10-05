let varNames = [];
let data = [];

function csvToArray(text, elemDelimiter, lineDelimiter, hasHeader) {
    let varNames = [];
    let data = [];
    let lines = text.replace(/"/g, "").split(lineDelimiter);
    let elemsLine = lines[0].split(elemDelimiter);
    let dataLength = 0;  // Counts the number of data entries currently
    if (hasHeader) {
        varNames = elemsLine;
    }
    else {  // Else, everything is data and varNames will be var1, var2, ...
        data[0] = [];
        for (let j = 1; j < elemsLine.length; j++) {
            varNames[j] = 'var_' + j;
            data[0][j] = elemsLine[j].replace(/"/g, "");
        }
        dataLength += 1;
    }
    for (let i = 1; i < lines.length; i++) {
        if (lines[i] != "") {
            data[dataLength] = [];
            let elemsLine = lines[i].split(elemDelimiter);
            // If there is a header, first row go to variableNames and the rest to data
            for (let j = 0; j < elemsLine.length; j++) {
                data[dataLength][j] = elemsLine[j].replace(/"/g, "");
            }
            dataLength += 1;
        }
    }
    return {'data': data, 'varNames': varNames};
}

function addOptions(containerId, optionNames, optionIds) {
    function createOption(containerId, optionId, optionVal) {
        let option = document.createElement('option');
        option.id = optionId;
        option.value = optionVal;
        option.innerText = optionVal;
        document.getElementById(containerId).appendChild(option);
        return option;
    }
    for (let i = 0; i < optionNames.length; i++) {
        createOption(containerId, optionIds[i], optionNames[i]);
    }
}

function extractData(data, varNames, selectedVarNames) {
    let temp = [];
    let name;
    // X, Y variables
    for (let i = 0; i < 3; i++) {
        name = selectedVarNames[i];
        for (let j = 0; j < varNames.length; j++) {
            if (name == varNames[j]) {
                temp[i] = data.map((val, idx) => val[j]);
                break;
            }
        }
    }
    // Z variables are in temp[2]
    let z = [];
    for (let i = 0; i < selectedVarNames[2].length; i++) {
        name = selectedVarNames[2][i];
        for (let j = 0; j < varNames.length; j++) {
            if (name == varNames[j]) {
                z[i] = data.map((val, idx) => val[j]);
                break;
            }
        }
    }
    return {'x': temp[0], 'y': temp[1], 'z': z};
}


function plotScatter3D(xData, yData, zArrayData, xyzVarNames, groupByVarName, containerId) {
    let traces = [];
    let colorList = Plotly.d3.scale.category10();  // default color list (one for each label)
    // Colorlist gives function style, i.e., colorList(k) gives the k-th color, an array is enough
    colorList = Array.apply(null, {length: 10}).map((val, idx) => colorList(idx));

    function getSymbolList () {
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

    function createDataTrace(x, y, z, name, color, symbol) {
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
                line: {
                    color: 'black',
                    //width: 3
                }
            },
            opacity: 0.7,
        };
        return trace;
    }

        // Create traces
    if (!groupByVarName) {  // No need to group points by label
        for (let i = 0; i < zArrayData.length; i++) {
            let zData = zArrayData[i];  // i-th variable to plot
            traces.push(
                createDataTrace(
                    xData,
                    yData,
                    zArrayData[i],
                    xyzVarNames[2][i],
                    colorList[0],
                    symbolList[i]
                )
            );
        }
    } else {  // If data has to be grouped
        let groupByColIdx = varNames.indexOf(groupByVarName);  // Column in data corresponding to grouping variable
        let groupByData = data.map((val, idx) => val[groupByColIdx]);
        let groupByUnique = groupByData.filter((val, idx, arr) => arr.indexOf(val) === idx).sort();

        for (let i = 0; i < zArrayData.length; i++) {
            let zData = zArrayData[i];  // i-th variable to plot
            for (let j = 0; j < groupByUnique.length; j++) {
                // Find values where j-th unique value appear
                let groupByFilter = groupByData.map((val, idx) => val === groupByUnique[j]);
                traces.push(
                    createDataTrace(
                        xData.filter((val, idx) => groupByFilter[idx] === true),
                        yData.filter((val, idx) => groupByFilter[idx] === true),
                        zData.filter((val, idx) => groupByFilter[idx] === true),
                        xyzVarNames[2][i] + ' (' + groupByVarName + '=' + groupByUnique[j] + ')',
                        colorList[j],
                        symbolList[i]
                    )
                );
            }
        }
    }
    let layout = {
        scene: {
            xaxis: {
                title: xyzVarNames[0],
            },
            yaxis: {
                title: xyzVarNames[1],
            },
            zaxis: {
            },
        }
    };
    //document.getElementById(containerId).setAttribute("style", "width:100%");
    Plotly.newPlot(containerId, traces, layout, {responsive: true});
}

window.onload = function() {
    let fileInput = document.getElementById('fileInput');
    let reader = new FileReader();
    //let fileDisplayArea = document.getElementById('displayArea');
    fileInput.addEventListener('change', function (evt) {
        let file = fileInput.files[0];
        reader.readAsText(file);
        reader.onload = function (evt) {
            document.getElementById("inputDisplayScroll").innerText = reader.result;
        };
    });
    // When upload button is pushed...
    document.getElementById("uploadButton").addEventListener('click', function(evt) {
            let hasHeadersBool = document.getElementById("hasHeaders").checked;
            let tmp = csvToArray(reader.result, ',', '\n', hasHeadersBool);
            data = tmp['data'];
            varNames = tmp['varNames'];
            //createCheckboxes(varNames, "featuresCheckboxDiv");
            addOptions("select-xaxis-var", varNames,
                varNames.map((elem, idx) => 'xaxis-var-option' + elem));
            addOptions("select-yaxis-var", varNames,
                varNames.map((elem, idx) => 'yaxis-var-option' + elem));
            addOptions("select-zaxis-var", varNames,
                varNames.map((elem, idx) => 'zaxis-var-option' + elem));
            addOptions("select-groupby-var", ['None'].concat(varNames),
                varNames.map((elem, idx) => 'groupby-var-option' + elem));
    });
    let plotScatter3DButton = document.getElementById('plotScatter3DButton');
    plotScatter3DButton.addEventListener('click', function(evt) {
        let xVarName = document.getElementById("select-xaxis-var").value;
        let yVarName = document.getElementById("select-yaxis-var").value;
        // z can be multiple values
        let selectedNodeList = document.querySelectorAll('#select-zaxis-var option:checked');
        let zVarNames = Array.from(selectedNodeList).map((elem, idx) => elem.value);
        let groupByVarName = document.getElementById('select-groupby-var').value;
        let extractedData = extractData(data, varNames, [xVarName, yVarName, zVarNames]);
        plotScatter3D(extractedData['x'], extractedData['y'], extractedData['z'],
            [xVarName, yVarName, zVarNames], groupByVarName, 'displayArea');
    });
    // TODO: bigger plot.
};
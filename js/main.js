window.onload = function() {

    let data;  // Data will be a global variable

    // Load file button
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

    // When upload button is pushed after loading data...
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

    document.getElementById("uploadButton").addEventListener('click', function(evt) {
        let hasHeadersBool = document.getElementById("hasHeaders").checked;
        let data = parse_text(reader.result, ',', '\n', hasHeadersBool);
        //createCheckboxes(varNames, "featuresCheckboxDiv");
        addOptions("select-xaxis-var", Object.keys(data),
            Object.keys(data).map((elem, idx) => 'xaxis-var-option' + elem));
        addOptions("select-yaxis-var", Object.keys(data),
            Object.keys(data).map((elem, idx) => 'yaxis-var-option' + elem));
        addOptions("select-zaxis-var", Object.keys(data),
            Object.keys(data).map((elem, idx) => 'zaxis-var-option' + elem));
        addOptions("select-groupby-var", ['None'].concat(Object.keys(data)),
            ['None'].concat(Object.keys(data)).map((elem, idx) => 'groupby-var-option' + elem));
    });
    let plotScatter3DButton = document.getElementById('plotScatter3DButton');
    plotScatter3DButton.addEventListener('click', function(evt) {
        let xVarName = document.getElementById("select-xaxis-var").value;
        let yVarName = document.getElementById("select-yaxis-var").value;
        // z can be multiple values
        let selectedNodeList = document.querySelectorAll('#select-zaxis-var option:checked');
        let zVarNames = Array.from(selectedNodeList).map((elem, idx) => elem.value);
        let groupByVarName = document.getElementById('select-groupby-var').value;
        if (groupByVarName === 'None') groupByVarName = false;
        plotScatter3D(data, xVarName, yVarName, zVarNames, groupByVarName, 'displayArea');
    });
    // TODO: bigger plot.
};
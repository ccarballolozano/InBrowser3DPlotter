window.onload = function() {

    let data;  // Data will be a global variable

    // Load file button
    let fileInput = document.getElementById('fileInput');
    let progressNode = document.getElementById("loadProgress");

    let reader = new FileReader();

    reader.onprogress = function(evt) {  // Track the load progress
        if (evt.lengthComputable) {
            progressNode.max = evt.total;
            progressNode.value = evt.loaded;
        }
    };

    reader.onload = function (evt) {
        data = reader.result;
        //document.getElementById("inputDisplayScroll").innerText = data;
    };

    fileInput.addEventListener('change', function (evt) {
        let file = fileInput.files[0];
        reader.readAsText(file);

    });

    // When upload button is pushed after loading data...
    document.getElementById("uploadButton").addEventListener('click', function(evt) {

        // Add options to a container, auxiliary function
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
        // Clear all options of a container
        function removeEveryChild(containerId) {
            let node = document.getElementById(containerId);
            while (node.firstChild) {
                node.removeChild(node.firstChild);
            }
        }

        let hasHeadersBool = document.getElementById("hasHeaders").checked;
        data = parse_text(reader.result, ',', '\n', hasHeadersBool);
        // Remove every child (options) from possible previous loadings
        removeEveryChild("select-xaxis-var");
        removeEveryChild("select-yaxis-var");
        removeEveryChild("select-zaxis-var");
        addOptions("select-xaxis-var", Object.keys(data[0]),
            Object.keys(data[0]).map((elem, idx) => 'xaxis-var-option' + elem));
        addOptions("select-yaxis-var", Object.keys(data[0]),
            Object.keys(data[0]).map((elem, idx) => 'yaxis-var-option' + elem));
        addOptions("select-zaxis-var", Object.keys(data[0]),
            Object.keys(data[0]).map((elem, idx) => 'zaxis-var-option' + elem));
        addOptions("select-groupby-var", ['None'].concat(Object.keys(data[0])),
            ['None'].concat(Object.keys(data[0])).map((elem, idx) => 'groupby-var-option' + elem));
    });

    // Get plotting options and plot

    let plotScatter3DButton = document.getElementById('plotScatter3DButton');

    plotScatter3DButton.addEventListener('click', function(evt) {

        function get_plot_config() {
            return {'markerSize': +document.getElementById('select-marker-size').value,
            'markerOpacity': +document.getElementById('select-marker-opacity').value,
            'markerLineWidth': +document.getElementById('select-marker-line-width').value
            };
        }

        let plotConfig = get_plot_config();
        let xVarName = document.getElementById("select-xaxis-var").value;
        let yVarName = document.getElementById("select-yaxis-var").value;
        // z can be multiple values
        let selectedNodeList = document.querySelectorAll('#select-zaxis-var option:checked');
        let zVarNames = Array.from(selectedNodeList).map((elem, idx) => elem.value);
        let groupByVarName = document.getElementById('select-groupby-var').value;
        if (groupByVarName === 'None') groupByVarName = false;

        plotScatter3D(data, xVarName, yVarName, zVarNames, groupByVarName, plotConfig, 'displayArea');
    });
};
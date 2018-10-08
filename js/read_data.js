/*
    Functions to read the users input data and parse them as a dictionary
 */

function parse_text(text, elemDelimiter, lineDelimiter, hasHeader) {
    let dataParsed = [];  // List of objects that will hold parsed data
    let varNames = [];  // Array of strings with variable names
    let lines = text.replace(/"/g, "").split(lineDelimiter);  // Array of arrays with data
    let currentLine = 0;  // counter for the number of rows parsed from text
    let nVars = lines[0].split(elemDelimiter).length;

    // Artificially add headers if not existent with names var1,...varN
    if (!hasHeader) {
        for (let i = 0; i < nVars; i++) {
            varNames[i] = 'var_' + i.toString();
        }
    } else {
        varNames = lines[0].split(elemDelimiter);
        currentLine += 1;  // one line has been parsed (to headers)
    }

    // Add data line by line
    for (let i = currentLine; i < lines.length; i++) {
        let elemParsed = {};  // Individual data
        let line;
        if ("" !== lines[currentLine]) {
            line = lines[currentLine].split(elemDelimiter);
            for (let j = 0; j < nVars; j++) {
                elemParsed[varNames[j]] = line[j].replace(/"/g, "");
            }
            dataParsed.push(elemParsed);
        }
        currentLine += 1;
    }
    return dataParsed
}


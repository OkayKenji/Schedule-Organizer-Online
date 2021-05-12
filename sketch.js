function preload() {
    jsonData = loadJSON("data.json");
}

function setup() {
    noCanvas();

    // button1 = createButton('Open subpage');
    // button1.position(0, 0);
    // button1.mousePressed(jsongen);

    button2 = createButton('Remove buttons and attributions');
    button2.position(105, 0);
    button2.mousePressed(printer);    

}

// function jsongen() {
//     window.open("/JSONGenerator");
// }

function printer() {
    let temp = document.getElementById("attributions");
    document.getElementsByTagName("body")[0].removeChild(temp);

    temp = document.getElementsByTagName("main")[0];
    document.getElementsByTagName("body")[0].removeChild(temp);

    temp = document.getElementsByTagName("button")[1];
    document.getElementsByTagName("body")[0].removeChild(temp);

    temp = document.getElementsByTagName("button")[1];
    document.getElementsByTagName("body")[0].removeChild(temp);

    print();
}

function draw() {
    createSelection(jsonData.classes.start,jsonData.classes.numWeeks);
    scheduleTableGen(); //dynmaically creates an empty table
    readInJSON();
    noLoop();
}
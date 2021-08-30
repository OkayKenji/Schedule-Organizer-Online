/**
 * @author Kenji
 *
 */
let jsonData;
let list = [
  ["_weekof_", "", "", "", "", "", "", ""],
  ["", "U", "M", "T", "W", "R", "F", "S"],
];
let listOfSemesters = [];
let index = 0;


const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

runProgram();
async function runProgram() {
  const response = await fetch('data.json');
  jsonData = await response.json();

  function printer() {
    let temp = document.getElementById("attributions");
    document.getElementsByTagName("header")[0].removeChild(temp);

    temp = document.getElementById("inputContainer");
    document.getElementsByTagName("header")[0].removeChild(temp);

    temp = document.getElementsByTagName("h1")[0];
    document.getElementsByTagName("header")[0].removeChild(temp);

    for (let i = 0; i < 8; i++) {
      let eee = document.getElementById(`0,${i}`);
      if (i == 0)
        eee.textContent = "General calander";
      else
        eee.textContent = daysOfTheWeek[i - 1];
    }
  }

  function closeDiv() {
    overlay.setAttribute("style", "display: none;");
  }

  document.getElementById("printerFriendly").addEventListener("click", printer);
  document.getElementById("exitButton").addEventListener("click", closeDiv);

  //gets the index (in the list of semesters) of the default semester
  for (let ele of jsonData.semesters) {
    listOfSemesters.push(ele.semester);
  }
  index = listOfSemesters.findIndex(element => element === jsonData.default);

  createSemesterSelection();

  updateWeekSelection(jsonData.semesters[index].start, jsonData.semesters[index].numWeeks);
  scheduleTableGen(); //dynmaically creates an empty table
  readInJSON();

  /**
   * Creates semester selection input.
   */
  function createSemesterSelection() {
    let sel = document.getElementById("currentSemester")
    sel.innerHTML = "";

    let options;
    for (let i = 0; i < listOfSemesters.length; i++) {
      options = document.createElement("option");
      options.textContent = listOfSemesters[i];
      options.setAttribute("value", listOfSemesters[i]);

      if (i == index) {
        options.selected = true;
      }

      sel.appendChild(options);
    }
    sel.addEventListener("change", semesterChanged);
  }

  /**
   * Calls updateWeekSelection with parameters and other methods
   */
  function semesterChanged() {
    index = listOfSemesters.findIndex(element => element === document.getElementById("currentSemester").value);

    updateWeekSelection(jsonData.semesters[index].start, jsonData.semesters[index].numWeeks);
    scheduleTableGen(); //dynmaically creates an empty table
    readInJSON();

  }

  /**
   * Creates selection input.
   * @param {String} startDate mm/dd/yyyy format
   * @param {Number} numweeks Must be <=99
   */
  function updateWeekSelection(startDate, numweeks) {
    startDate = new Date(startDate);
    let sel = document.getElementById("selectWeek")
    sel.innerHTML = "";

    let options;
    for (let i = 0; i < numweeks; i++) {
      options = document.createElement("option");
      options.textContent = `Week ${i}: Week of ${months[startDate.getMonth()]} ${startDate.getDate()}`;
      options.setAttribute("value", `Week ${i}: Week of ${months[startDate.getMonth()]} ${startDate.getDate()}`);
      sel.appendChild(options);
      startDate = new Date(startDate.setDate(startDate.getDate() + 7));
    }
    sel.addEventListener("change", readInJSON);
  }

  /**
   * Creates an empty table
   * Adapted from "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces"
   * to dynamically create tables.
   */
  function scheduleTableGen() {
    let body = document.getElementById("tableDiv");
    body.innerHTML = "";
    let tbl = document.createElement("table");
    let tblBody = document.createElement("tbody");

    let hour = 7;
    let minute = -10;

    for (let timeOfDay = 0; timeOfDay < 97; timeOfDay++) { //loop for each of the rows (times)
      let row = document.createElement("tr");

      for (let dayOfWeek = 0; dayOfWeek < list[0].length; dayOfWeek++) { //for each the cols (days of week)
        let cell = document.createElement("td");
        let cellInfo;

        if (timeOfDay == 0) { //what to do for the first row
          cellInfo = document.createTextNode("");
        } else { //rest of the rows
          if (dayOfWeek == 0) { //what to do for the first col (displays the time)
            if (minute == 0) {
              minute = "00";
            } //in case minute is 0, it has to be changed to 00 on dispaly 

            cellInfo = document.createTextNode(hour + ":" + minute);
            minute = Number.parseInt(minute);
          } else { //what to do for the rest of the cols
            cellInfo = document.createTextNode("");
          }
        }

        cell.appendChild(cellInfo);
        cell.setAttribute("id", timeOfDay + "," + dayOfWeek);
        row.appendChild(cell);

      }

      if (timeOfDay % 6 == 0) {
        hour++;
        minute = -10;
      }

      minute += 10;
      tblBody.appendChild(row);
    }

    tbl.appendChild(tblBody);
    tbl.setAttribute("id", "schedule")

    body.appendChild(tbl);

  }

  /**
   * Method responsible for reading in data from json file, proccessing the data, then calling other
   * methods to display each of the classes
   * 
   * Currently can only read in classes
   */
  function readInJSON() {
    let k = 0;
    const thisSemester = jsonData.semesters[index];
    const thisSemesterClasses = thisSemester.classList;
    updateDates();

    while (k < thisSemesterClasses.length) {
      let thisClass = thisSemesterClasses[k];
      let daysTxt = thisClass.days;

      let days = []; //arr to store days of week class meets...
      for (let i = 0; i < daysTxt.length; i++) { //gets all of the days the class meets into the arr
        days.push(daysTxt.charAt(i));
      }

      for (let i = 0; i < days.length; i++) { //saves the col index (on the table) of where to expect day of the week
        days[i] = list[1].indexOf(days[i]);
      } //...so really not the "days" but more like "index"

      let period = []; //stores rounded time class starts and ends
      let startTime = thisClass.classStart;
      let endTime = thisClass.classEnd;

      //rounds time
      if (startTime.charAt(startTime.length - 1) == "5") { //if the start time ends in 5, converts start time so it's 5 minutes earlier 
        let min = Number.parseInt(startTime.substring(startTime.length - 2));
        min -= 5;
        if (min == 0) //edge case
          startTime = startTime.substring(0, startTime.indexOf(":") + 1) + "00";
        else
          startTime = startTime.substring(0, startTime.indexOf(":") + 1) + min;
      }

      //rounds time
      if (endTime.charAt(endTime.length - 1) == "5") { //if the end time ends in 5, converts end time so it's 5 minutes later
        let min = Number.parseInt(endTime.substring(endTime.length - 2));
        min += 5;
        if (min == 60) { //edge case 
          let hour = Number.parseInt(endTime.substring(0, endTime.indexOf(":")));
          hour++;
          endTime = hour + ":00";
        } else
          endTime = endTime.substring(0, endTime.indexOf(":") + 1) + min;
      }

      period.push(startTime);
      period.push(endTime);

      updateTable(calculateCords(days, period), thisClass);
      k++;
    } //end outter-most while loop

    for (let dayOfWeek = 0; dayOfWeek < list[0].length; dayOfWeek++) { //updates the first row
      let cell = document.getElementById(0 + "," + dayOfWeek);
      if (dayOfWeek == 0) {
        cell.innerHTML = "Week of " + list[0][dayOfWeek];
      } else {
        cell.innerHTML = daysOfTheWeek[dayOfWeek - 1] + " (" + list[0][dayOfWeek] + ")";
        cell.addEventListener("click", clickable);
      }
    }

    let body = document.getElementById("tableDiv");
    try { //if a heading element already exists removes it
      let temp = document.getElementById("semester");
      body.removeChild(temp);
    } catch {
      //do nothing
    }

    //creates heading with the semester
    let heading = document.createElement("h2");
    heading.innerHTML = thisSemester.semester;
    heading.setAttribute("id", "semester");
    body.insertBefore(heading, document.getElementById('schedule'));

  }

  /**
   * Method that returns the cords of where the class should be placed on the table, and where it should end.
   * @param {Array} days An array contaning the col index which correlate with the days the event is held.
   * @param {Array} period An array with two elements, the first the start time of the event, and the end time of the event.
   *                      (note: the start and end time should not end with "5"; start times: 10:05 -> 10:00; end times: 11:55 -> 12:00)
   * 
   * @returns 2D Array.[ [col1, rowStart1, rowEnd1], 
   *                     [col2, rowStart2, rowEnd2]... ]
   * col1 - The col index where the 1st day of event/class should be 
   * rowStart1 - The row index where the 1st day of event/class should be 
   * rowEnd2 - The row index last cell that should removed for 1st day.
   * 
   * col2 - The col index where the 2nd day of event/class should be 
   * rowStart2 - The row index where the 2nd day of event/class should be 
   * rowEnd2 - The row index last cell that should removed for 2nd day.
   */
  function calculateCords(days, period) {
    let instruct = [
      []
    ];
    for (let i = 0; i < days.length; i++) { //loop for each day of event
      instruct[i].push(days[i]); //saves col

      for (let j = 0; j < period.length; j++) { //gets both the rowStart and rowEnd
        let counter = 0;
        someCurrent = document.getElementById("schedule").getElementsByTagName("tr")[counter].getElementsByTagName("td")[0].innerHTML;

        while (someCurrent != period[j] && counter < document.getElementById("schedule").getElementsByTagName("tr").length) {
          someCurrent = document.getElementById("schedule").getElementsByTagName("tr")[counter].getElementsByTagName("td")[0].innerHTML;
          counter++;
        }
        counter--; //off by one error...
        instruct[i].push(counter);
      }

      instruct.push([]);
    }

    instruct.pop();
    return instruct;
  }

  /**
   * Updates the table with the events
   * @param {Array} instuctions See calculateCords() return value.
   * @param {Object} event JS object that has the data about the event. 
   *                  JS object MUST have ".title", a ".color.background", ".color.textColor", and ".color.border"
   */
  function updateTable(instuctions, event) {
    for (let i = 0; i < instuctions.length; i++) { //does something for each of the days event is held
      let col = instuctions[i][0];
      let rowStart = instuctions[i][1];
      let rowEnd = instuctions[i][2];

      let rowspan = (rowEnd - rowStart) + 1;
      let cell = document.getElementById(rowStart + "," + col);
      if (cell) { //only if cell is defined  (exists)
        //adds attributes to change the rowSpan, creates the "merged cell" effect
        //                to make an event happend well the cell is clicked
        cell.setAttribute("rowspan", rowspan);
        cell.addEventListener("click", generateInfobox);

        //changes how the cell looks, and adds the name of the event
        cell.style.background = event.color.background;
        cell.style.color = event.color.textColor;
        cell.style.border = event.color.border;

        cell.setAttribute("value", event.title);

        cell.innerHTML = ""; //resets fffff

        let clonedTemp = document.getElementById("template0").content.firstElementChild.cloneNode(true);
        let clonedTempSpanArr = clonedTemp.getElementsByTagName("span");

        for (let ele of clonedTempSpanArr) {
          switch (ele.getAttribute("id")) {
            case `course`:
              ele.textContent = `${event.course}`;
              break;
            case `title`:
              ele.textContent = `${event.title}`;
              break;
            case `crn`:
              ele.textContent = `${event.crn}`;
              break;
            case `times`:
              ele.textContent = `${event.classStart}-${event.classEnd}`;
              break;
            case `location`:
              ele.textContent = `${event.classRoom}`;
              break;
          }
        }

        cell.appendChild(clonedTemp);

      } else {
        console.log("Error! Cell does not exist, check to make sure there are no conflicts!");
      }

      //after the cell is expanded, the cells it overlaps with has to be removed
      for (let j = rowStart + 1; j <= rowEnd; j++) { //removes unneeded cells
        if (document.getElementById(j + "," + col)) {
          let temp = document.getElementById(j + "," + col);
          document.getElementById("schedule").getElementsByTagName("tr")[j].removeChild(temp);
        }
      }

    }

  }

  /**
   * Adapted from "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog"
   * Note: only can support classes at this time.
   * Displays information about the event, either as a "dialog box" or an "details". 
   * 
   * @param {String} name The name of the event.
   * @param {Number} col The col of the event that clicked.
   */
  function generateInfobox() {
    let name = this.getAttribute("value");
    let col = Number.parseInt(this.id.substring(this.id.indexOf(",") + 1));

    let classArray = jsonData.semesters[index].classList;
    let data;

    for (let i = 0; i < classArray.length; i++)
      if (name == classArray[i].title)
        data = classArray[i];

    overlay.setAttribute("style", "display: grid;");
    let pToUpdate = document.getElementById('innerDivOverlay');
    pToUpdate.innerHTML = "";
    updateParagraph(pToUpdate, data, col);
  }

  /**
   * Note: Can only support classes at this time. 
   * @param {<p> element} para <p> paragraph element to be edited.
   * @param {Object} data JS object
   */
  function updateParagraph(para, data, col) {
    if (data) {
      let clonedTemp = document.getElementById("template1").content.firstElementChild.cloneNode(true);
      let clonedTempSpanArr = clonedTemp.getElementsByTagName("span");
      for (let ele of clonedTempSpanArr) {
        switch (ele.getAttribute("id")) {
          case `heading`:
            ele.textContent = `${data.course} - ${data.title} (${data.crn})`;
            break;
          case `instructor`:
            ele.textContent = `${data.classIns}`;
            break;
          case `time`:
            ele.textContent = `${data.classStart}-${data.classEnd}`;
            break;
          case `days`:
            ele.textContent = `${data.days}`;
            break;
          case `classroom`:
            ele.textContent = `${data.classRoom}`;
            break;
        }
      }

      let clonedTempDivArr = clonedTemp.getElementsByTagName("div");

      let a = [];
      let d = [];

      for (let ele of data.assignments) {
        if (ele.dueDate.includes(list[0][col]))
          d.push(ele);
        if (ele.assignedDate.includes(list[0][col]))
          a.push(ele);
      }

      generateBullets(d, clonedTempDivArr[0], true);
      generateBullets(a, clonedTempDivArr[1], false);

      clonedTemp.getElementsByTagName("small")[0].textContent = `Data for: ${list[0][col]}`;

      para.appendChild(clonedTemp);
    } else {
      para.textContent = "Some error occured. Data not found."
    }

  }

  /**
   * Creates a bullet list of homework
   * @param {*} homeworkList List of homework assigments
   * @param {*} divToEdit Div to add bullet to
   */
  function generateBullets(homeworkList, divToEdit, dueToday) {
    if (homeworkList.length > 0) {
      let outerContainer = document.createElement("ul");
      for (let ele of homeworkList) {
        let point = document.createElement("li")
        point.appendChild(document.createTextNode(`${ele.title}, ${ele.description} (${ele.type})`));
        if (dueToday) {
          point.appendChild(document.createTextNode(` (Originally assigned on ${ele.assignedDate})`));
        } else {
          point.appendChild(document.createTextNode(` (Due on ${ele.dueDate})`));
        }
        
        outerContainer.appendChild(point)
      }
      divToEdit.appendChild(outerContainer);
    } else {
      divToEdit.appendChild(document.createTextNode(`None`));
    }
  }

  //
  function clickable() {
    let date = this.textContent.substring(this.textContent.indexOf("(") + 1, this.textContent.length - 1)

    let list = jsonData.semesters[index].classList;
    let totalList = [];
    for (let classElement of list) {
      for (let ele of classElement.assignments) {
        ele.name = classElement.title;
        totalList.push(ele);
      }
    }

    for (let i = totalList.length - 1; i >= 0; i--) {
      if (!(totalList[i].assignedDate.includes(date) || totalList[i].dueDate.includes(date))) {
        totalList.splice(i, 1);
      }
    }

    if (totalList.length > 0) {
      overlay.setAttribute("style", "display: grid;");
      let pToUpdate = document.getElementById('innerDivOverlay');
      pToUpdate.innerHTML = "";
      updateParagraphB(pToUpdate, totalList, date);
    }

  }

  function updateParagraphB(pElement, totalList, date) {

    let clonedTemp = document.getElementById("template2").content.firstElementChild.cloneNode(true);
    let clonedSpanDivArr = clonedTemp.getElementsByTagName("span");
    let clonedTempDivArr = clonedTemp.getElementsByTagName("div");


    let a = [];
    let d = [];

    for (let ele of totalList) {
      if (ele.dueDate.includes(date))
        d.push(ele);
      if (ele.assignedDate.includes(date))
        a.push(ele);
    }

    clonedSpanDivArr[0].textContent = date;
    clonedSpanDivArr[1].textContent = date;

    generateBulletsB(d, clonedTempDivArr[0], true)
    generateBulletsB(a, clonedTempDivArr[1], false)

    pElement.appendChild(clonedTemp);
  }

  /**
   * Creates a bullet list of homework
   * @param {*} homeworkList List of homework assigments
   * @param {*} divToEdit Div to add bullet to
   */
  function generateBulletsB(homeworkList, divToEdit, dueToday) {
    if (homeworkList.length > 0) {
      let outerContainer = document.createElement("ul");
      for (let ele of homeworkList) {
        let point = document.createElement("li")
        let bald = document.createElement("b");
        bald.textContent = `${ele.name}: `;
        point.appendChild(bald);
        point.appendChild(document.createTextNode(`${ele.title}, ${ele.description} (${ele.type})`));
        if (dueToday) {
          point.appendChild(document.createTextNode(` (Originally assigned on ${ele.assignedDate})`));
        } else {
          point.appendChild(document.createTextNode(` (Due on ${ele.dueDate})`));
        }
        outerContainer.appendChild(point)
      }
      divToEdit.appendChild(outerContainer);
    } else {
      divToEdit.appendChild(document.createTextNode(`None`));
    }
  }

  /**
   * Updates list array to reflect the week that is currently selected.
   */
  function updateDates() {
    let selValue = document.getElementById("selectWeek").value;
    let x = selValue.charAt(5) + selValue.charAt(6)
    x = Number.parseInt(x.replace(":", ""));

    let startDate = new Date(jsonData.semesters[index].start);
    let week = new Date(startDate.setDate(startDate.getDate() + (7 * x)))
    list[0][0] = months[week.getMonth()] + " " + week.getDate();

    let curr = new Date(week);
    for (let i = 1; i < list[0].length; i++) {
      list[0][i] = (curr.getMonth() + 1) + "/" + curr.getDate();
      curr = new Date(curr.setDate(curr.getDate() + 1));
    }
  }
}

/**
 * @author Kenji
 * 
 * Please also see sketch.js. For the functions to work, sketch.js must prelaod json file.
 * 
 * Attriubation:
 *   W3Schools
 *   Mozilla Contributors
 *   Coding Train
 *   P5.js Contributors
 */
let jsonData;
let sel;
let list = [
  ["_weekof_", "", "", "", "", "", "", ""],
  ["", "U", "M", "T", "W", "R", "F", "S"],
];

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const daysOfTheWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/**
 * Method responsible for reading in data from json file, proccessing the data, then calling other
 * methods to display each of the classes
 * 
 * Currently can only read in classes
 */
function readInJSON() {
  let k = 0;
  let thisSemester = jsonData.classes.classList;
  updateDates();

  while (k < thisSemester.length) {
    let thisClass = thisSemester[k];
    let c = thisClass.days;

    let days = []; //array to store all the days of the week the class meets
    for (let i = 0; i < c.length; i++) { //gets all of the days of the week the class meets
      days.push(c.charAt(i));
    }

    for (let i = 0; i < days.length; i++) { //saves the col index (on the table) of where to expect day of the week
      days[i] = list[1].indexOf(days[i]);
    }

    let period = [];
    let startTime = thisClass.classStart;
    let endTime = thisClass.classEnd;

    if (startTime.charAt(startTime.length - 1) == "5") { //if the start time ends in 5, converts start time so it's 5 minutes earlier 
      let min = Number.parseInt(startTime.substring(startTime.length-2));
      min -= 5;
      if (min == 0) //edge case
        startTime = startTime.substring(0, startTime.indexOf(":")+1) + "00";
      else
        startTime = startTime.substring(0, startTime.indexOf(":")+1) + min;
    }

    if (endTime.charAt(endTime.length - 1) == "5") { //if the end time ends in 5, converts end time so it's 5 minutes later
      let min = Number.parseInt(endTime.substring(endTime.length-2));
      min += 5;
      if (min == 60) { //edge case 
        let hour = Number.parseInt(endTime.substring(0, endTime.indexOf(":")));
        hour++;
        endTime = hour + ":00";
      } else
        endTime = endTime.substring(0, endTime.indexOf(":")+1) + min;
    }

    period.push(startTime);
    period.push(endTime);

    updateTable(calculateCords(days, period), thisClass);
    k++;
  }

  for (let dayOfWeek = 0; dayOfWeek < list[0].length; dayOfWeek++) { //updates the first row
    let cell = document.getElementById(0 + "," + dayOfWeek);
    if (dayOfWeek == 0) {
      cell.innerHTML = "Week of " + list[0][dayOfWeek];
    } else {
      cell.innerHTML = daysOfTheWeek[dayOfWeek - 1] + " (" + list[0][dayOfWeek] + ")";
      cell.setAttribute("onclick","clickable(\""+list[0][dayOfWeek]+"\")");
    }
  }

  let body = document.getElementsByTagName("body")[0];
  try { //if a heading element already exists removes it
    let temp = document.getElementById("semester");
    body.removeChild(temp);
  } catch {
    //do nothing
  }
  
  //creates heading with the semester
  let heading = document.createElement("h2");
  heading.innerHTML = jsonData.classes.semester;
  heading.setAttribute("id", "semester");
  body.insertBefore(heading, document.getElementById('schedule'));

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
      cell.setAttribute("onclick", "generateInfobox(\"" + event.title + "\"," + col + ")");

      //changes how the cell looks, and adds the name of the event
      cell.style.background = event.color.background;
      cell.style.color = event.color.textColor;
      cell.style.border = event.color.border;
      cell.innerHTML = event.title;
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
 * Method that returns the cords of where the class should be placed on the table, and where it should end.
 * @param {Array} days An array contaning the col index which correlate with the days the event is held.
 * @param {Array} times An array with two elements, the first the start time of the event, and the end time of the event.
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
function calculateCords(days, times) {
  let instruct = [
    []
  ];
  for (let i = 0; i < days.length; i++) { //loop for each day of event
    instruct[i].push(days[i]); //saves col

    for (let j = 0; j < times.length; j++) { //gets both the rowStart and rowEnd
      let counter = 0;
      someCurrent = document.getElementById("schedule").getElementsByTagName("tr")[counter].getElementsByTagName("td")[0].innerHTML;
      
      while (someCurrent != times[j] && counter<document.getElementById("schedule").getElementsByTagName("tr").length) {
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
 * Adapted from "https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Traversing_an_HTML_table_with_JavaScript_and_DOM_Interfaces"
 * to dynamically create tables.
 */
function scheduleTableGen() {
  let body = document.getElementsByTagName("body")[0];
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
 * Adapted from "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog"
 * Note: only can support classes at this time.
 * Displays information about the event, either as a "dialog box" or an "details". 
 * 
 * @param {String} name The name of the event.
 * @param {Number} col The col of the event that clicked.
 */
function generateInfobox(name, col) {
  let classArray = jsonData.classes.classList;
  let data;

  for (let i = 0; i < classArray.length; i++)
    if (name == classArray[i].title)
      data = classArray[i];

  try { //it seems that showModal may or may not be always supported! 
    let dialog = document.getElementById('dialogInfobox');
    let pToUpdate = document.getElementById('dialogInfoboxInfo');

    updateParagraph(pToUpdate, data, col)

    dialog.showModal();
    

  } catch { //for the cases where showModal is not supported
    let body = document.getElementsByTagName("body")[0];

    try { //if a details element already exists removes it
      let temp = body.getElementsByTagName("details")[0];
      body.removeChild(temp);
    } catch {
      //do nothing
    }

    let detail = document.createElement("details");
    let summ = document.createElement("summary")
    summ.innerHTML = "Class data:";
    detail.appendChild(summ);

    let para = document.createElement("p");

    updateParagraph(para, data, col);

    detail.appendChild(para);
    body.insertBefore(detail, document.getElementById('schedule'));
  }

}

/**
 * Closes the dialogBox
 */
function closeDialogBox() {
  try { //it seems that dialog element may or may not be always supported!
    let dialog = document.getElementById('dialogInfobox');
    dialog.close();
  } catch {
    alert("Error");
  }
}

/**
 * Note: Can only support classes at this time. 
 * @param {<p> element} para <p> paragraph element to be edited.
 * @param {Object} data JS object
 */
function updateParagraph(para, data, col) {
  if (data) {
    let reply = "<span><b>" + data.course + " - " + data.title + " (" + data.crn + ")</b></span>";
    reply += "<br><b>Instructor:</b> " + data.classIns;
    reply += "<br><b>Time:</b> " + data.classStart + "-" + data.classEnd;
    reply += "<br><b>Days:</b> " + data.days;
    reply += "<br><b>Online link:</b> " + data.online;
    reply += "<br><b>Classroom:</b> " + data.classRoom;

    let a = [];   
    let d = [];
  
    for (let ele of data.assignments) {
      if (ele.dueDate.includes(list[0][col]))
        d.push(ele);
      if (ele.assignedDate.includes(list[0][col]))
        a.push(ele);
    }

    if (d.length>0) {
      reply+= "<br><b>Due today:</b><ul>";
  
      for (let ele of d) {
        reply+="<li>"+ele.title + ", " + ele.description + " (" + ele.type + ")</li>"
      }
      reply +="</ul>"
    } else
     reply += "<br><b>Due today:</b> None"
    
    if (a.length>0) {
      reply+= "<br><b>Assigned today:</b><ul>";
  
      for (let ele of a) {
        reply+="<li>" + ele.title + ", " + ele.description + " (" + ele.type + ")</li>"
      }
      reply +="</ul>"
    } else 
      reply += "<br><b>Assigned today:</b> None"

    para.innerHTML = reply;
  } else {
    para.innerHTML = "Some error occured. Data not found."
  }

}

/**
 * Creates selection input.
 * @param {String} startDate month day, year 00:00:00 format
 * @param {Number} numweeks Must be <=99
 */
function createSelection(startDate, numweeks) {
  startDate = new Date(startDate);

  sel = createSelect();
  sel.position(315, 0);

  for (let i = 0; i < numweeks; i++) {
    sel.option("Week " + i + ": Week of " + months[startDate.getMonth()] + " " + startDate.getDate())
    startDate = new Date(startDate.setDate(startDate.getDate() + 7));
  }
  sel.changed(readInJSON);

}

/**
 * Updates list array to reflect the week that is currently selected.
 */
function updateDates() {
  let selValue = sel.value();
  let x = selValue.charAt(5) + selValue.charAt(6)
  x = Number.parseInt(x.replace(":", ""));

  let startDate = new Date(jsonData.classes.start)
  let week = new Date(startDate.setDate(startDate.getDate() + (7 * x)))
  list[0][0] = months[week.getMonth()] + " " + week.getDate();

  let curr = new Date(week);
  for (let i = 1; i < list[0].length; i++) {
    list[0][i] = (curr.getMonth() + 1) + "/" + curr.getDate();
    curr = new Date(curr.setDate(curr.getDate() + 1));
  }
}

//https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
function clickable(date) {
  let list = jsonData.classes.classList;
  let totalList = [];
  for (let classElement of list) {
    for (let ele of classElement.assignments) {
      ele.name = classElement.title;
      totalList.push(ele);
    }
  }

  for (let i = totalList.length - 1 ; i >=0 ; i-- ) {
    if (!(totalList[i].assignedDate.includes(date)||totalList[i].dueDate.includes(date))) {
      totalList.splice(i,1);
    }
  }

  if (totalList.length>0) {
    try { //it seems that showModal may or may not be always supported! 
      let dialog = document.getElementById('dialogInfobox');
      let pToUpdate = document.getElementById('dialogInfoboxInfo');
  
      updateParagraphB(pToUpdate,totalList,date);
  
      dialog.showModal();
  
    } catch { //for the cases where showModal is not supported
      let body = document.getElementsByTagName("body")[0];
  
      try { //if a details element already exists removes it
        let temp = body.getElementsByTagName("details")[0];
        body.removeChild(temp);
      } catch {
        //do nothing
      }
  
      let detail = document.createElement("details");
      let summ = document.createElement("summary")
      summ.innerHTML = "Class data:";
      detail.appendChild(summ);
  
      let para = document.createElement("p");
  
      updateParagraphB(para, totalList,date);
  
      detail.appendChild(para);
      body.insertBefore(detail, document.getElementById('schedule'));
    }
  }
  
} 

function updateParagraphB(pElement, totalList,date) {
  let a = [];   
  let d = [];

  for (let ele of totalList) {
    if (ele.dueDate.includes(date))
      d.push(ele);
    if (ele.assignedDate.includes(date))
      a.push(ele);
  }

  let reply = "";
  if (d.length>0) {
    reply+= "<b>Due today ("+date+"):</b><ul>";

    for (let ele of d) {
      reply+="<li><b>"+ele.name+":</b> " + ele.title + ", " + ele.description + " (" + ele.type + ")</li>"
    }
    reply +="</ul>"
  } else
   reply += "<br><b>Due today ("+date+"):</b> None"
  
  if (a.length>0) {
    reply+= "<br><b>Assigned today ("+date+"):</b><ul>";

    for (let ele of a) {
      reply+="<li><b>"+ele.name+":</b> " + ele.title + ", " + ele.description + " (" + ele.type + ")</li>"
    }
    reply +="</ul>"
  } else 
    reply += "<br><b>Assigned today ("+date+"):</b> None"

  pElement.innerHTML = reply;
}
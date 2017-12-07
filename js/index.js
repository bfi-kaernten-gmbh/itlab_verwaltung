// get needed modules
import GetSheetDone from 'get-sheet-done';
import moment from 'moment';
import _ from 'lodash'

// Use the first element in array to convert
// any other data into an object
var twodarray = (arr) => {
  var keys = arr.shift();
  keys = keys.map(item => removeWhitespace(item))
  return arr.map((i)=>{
    var o={};
    for(var j=0;j<keys.length;j++) {
      if(typeof i[j] === 'undefined') {
        o[keys[j].toLowerCase()] = "";
      } else {
        o[keys[j].toLowerCase()] = i[j];
      }
    }

    return o;
  });
}

// init calendar plugin "from"
var calenderFrom = new dhtmlXCalendarObject("from");
calenderFrom.setSkin("material");
calenderFrom.setDateFormat("%d.%m.%Y");

// init calendar plugin "to"
var calenderTo = new dhtmlXCalendarObject("to");
calenderTo.setSkin("material");
calenderTo.setDateFormat("%d.%m.%Y");


// set from and to variables for later use
// holds index number that matches the selected date in the dataArray
var curFrom;
var curTo;

// listen to change event on calender "From" & "To"
// calls function if both curFrom and curTo varaibles have
// a value & "to" has a bigger value than "from"
// counts for both onChange events
calenderFrom.attachEvent("onChange", function(date, state){
    //console.log(moment(date).format('DD.MM.YYYY'));
    curFrom = findInArray(dataArray, 'datum', moment(date).format('YYYY-MM-DD'));
    //console.log(curFrom);
    if(curFrom >= 0 && curTo >= 0 && curFrom <= curTo) {
      updateTrainerTable();
      updateDataTable();
    }
});
calenderTo.attachEvent("onChange", function(date, state){
    //console.log(moment(date).format('YYYY-MM-DD'));
    curTo = findInArray(dataArray, 'datum', moment(date).format('YYYY-MM-DD'));
    //console.log(curTo);

    if(curFrom >= 0 && curTo >= 0 && curFrom <= curTo) {
      updateTrainerTable();
      updateDataTable();
    }
});

// holds trainer names that are selected
var trainer = [];
// holds whole data from google spreadsheet
var dataArray;

// get google spreadsheet data
GetSheetDone.raw('1Qaoq2mNojwEipDDiMnqclSaAgtqmX4XLy7q6659br8U').then(sheet => {
  dataArray = twodarray(sheet.data);
  console.log(dataArray);
  createOptions(dataArray)
  stopLoading();
});

// create all options that need to be initialized through the
// spreadsheet data
function createOptions(data) {
  var options = document.getElementById('options');

  var trainerOptions = document.getElementById('trainer_options');
  var list = getTrainerNames(data);
  for(var i in list) {
    trainerOptions.innerHTML += '<option value='+list[i]+'>' + list[i] + '</option>'
  }
  chosenInit();
}
function stopLoading() {
  var laoder = document.getElementById('loader');
  loader.classList += ' hide';
}

// chosen plugin initialization
const chosenInit = () => {
  $(".chosen-select").chosen({no_results_text: "Oops, nothing found!"});
  // listen to changes on the trainer dropdown and push name into trainer variable
  $('.chosen-select').on('change', function(evt, selected) {
    if(selected.selected) {
      trainer.push(selected.selected);
    } else if(selected.deselected) {
      var index = trainer.indexOf(selected.deselected);
      trainer.splice(index, 1);
    }
    if(curFrom >= 0 && curTo >= 0 && curFrom <= curTo) {
      updateTrainerTable();
      updateDataTable();
    }
    if(trainer.length === 0) {
      removeContent(document.getElementById('trainer-c'));
    }
  });
}

const getTrainerNames = (data) => {
  var propArray = Object.getOwnPropertyNames(data[0]);
  var trainerList  = [];
  propArray.forEach(function (item) {
    if(item.search('start') !== -1) {
      trainerList.push(item.replace('start', ''));
    }
  })
  return trainerList;
}


const updateTrainerTable = () => {

  if(trainer.length > 0) {
    removeContent(document.getElementById('trainer-c'));
    for (var i = 0; i < trainer.length; i++) {
      var hoursArray = [];
      var daysAttended = 0;
      for (var c = curFrom; c <= curTo; c++) {

        var start = dataArray[c][trainer[i]+'start'];
        var end = dataArray[c][trainer[i]+'end'];

        if(start && end) {
          hoursArray.push(getHours(start,end));
          daysAttended += 1;
        }
      }
      //console.log(hoursArray);
      var hoursTotal = getTotalHours(hoursArray);
      var daysCounted = (curTo - curFrom) + 1;
      renderTrainerHours(trainer[i], hoursTotal, daysCounted, daysAttended);
      new Clipboard('.trainer');
    }
  }
}

function getHours(start, end) {
  var start = start.split(':'),
      end = end.split(':'),
      sh = parseInt(start[0]),
      sm = parseInt(start[1]),
      eh = parseInt(end[0]),
      em = parseInt(end[1]);

  //console.log((((eh * 60) + em)-((sh*60) + sm)) % 60); getMinutes
  //console.log((((eh * 60) + em)-((sh*60) + sm)) / 60); getHours
  var result = (((eh * 60) + em)-((sh*60) + sm)) / 60;

  if(result > 6) {
    return result - 0.5;
  } else {
    return result;
  }
}

function getTotalHours(array) {
  var totalHours = 0;
  for (var i = 0; i < array.length; i++) {
    totalHours += array[i];
  }
  return totalHours;
}

function removeContent(el) {
  var Container = el;
  while (Container.lastChild) {
    Container.removeChild(Container.lastChild);
  }
}

function renderTrainerHours(name, hours, daysCounted, daysAttended) {
  console.log(daysAttended);
  var tContainer = document.getElementById('trainer-c');
  if (isInt(hours)) {
    tContainer.innerHTML += '<div class="trainer" data-clipboard-target="#'+ name +'"> <h3>' + name +'</h3><p class="hours" id="'+ name +'">'+ hours + '</p><p>'+ daysCounted +'</p><p data-test="hi">'+ daysAttended +'</p></div>';
  } else {
    var parsedHours = parseInt(hours),
    parsedMinutes = (hours - parseInt(hours)) * 60;
    tContainer.innerHTML += '<div class="trainer" data-clipboard-target="#'+ name +'"> <h3>' + name +'</h3><p class="hours" id="'+ name +'">'+ parsedHours + ' / ' + parsedMinutes + '</p><p>'+ daysCounted +'</p><p data-test="hi">'+ daysAttended +'</p></div>';
  }

}

const findInArray = (array, attr, value) => {
  var value = isWeekendDay(value);

  for (var i = 0; i < array.length; i++) {
    //console.log('moment ' + moment(array[i][attr]).format('YYYY-MM-DD'), 'orig date '+ array[i][attr]);
    if(array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}
// Saturday = 6
// Sunday = 0
function isWeekendDay(date) {
  if(moment(date).day() === 6) {
    var newDate = moment(date).subtract(1,'d');
    return newDate.format('YYYY-MM-DD');
  } else if(moment(date).day() === 0) {
    var newDate = moment(date).subtract(2,'d');
    return newDate.format('YYYY-MM-DD');
  } else {
    return date;
  }
}

// check if number is an integer
function isInt(n) {
   return n % 1 === 0;
}

function updateDataTable() {
  removeContent(document.getElementById('data_table'));
  removeContent(document.getElementById('data_table_pagination'));
  var tag = '<div class="tag">';
  var datum = '<div class="datum">';
  if(trainer.length > 0) {
    for (var i = 0; i < trainer.length; i++) {
      var trainerStart = '<div class="trainerStart">';
      var trainerEnd = '<div class="trainerEnd">';
      for(var c = curFrom; c <= curTo; c++) {
        if (i === 0) {
          tag += '<div>'+ dataArray[c].tag + '</div>';
          datum += '<div>'+ dataArray[c].datum + '</div>';
        }
        trainerStart += '<div>' + dataArray[c][trainer[i]+'start'] +'</div>';
        trainerEnd += '<div>' + dataArray[c][trainer[i]+'end'] +'</div>';
      }
      if(i === 0) {
        tag += '</div>';
        datum += '</div>';
        document.getElementById('data_table_pagination').innerHTML += '<div class="tag"><h3>Tag</h3></div> <div class="datum"><h3>Datum</h3></div>';
        document.getElementById('data_table').innerHTML += tag + datum;
      }
      trainerStart += '</div>';
      trainerEnd += '<div>';
      document.getElementById('data_table_pagination').innerHTML += '<div><h3>' + trainer[i] +'start</h3></div><div><h3>' + trainer[i] +'end</h3></div>';
      document.getElementById('data_table').innerHTML += trainerStart + trainerEnd;
    }
    console.log(tag, datum);

  }
}

function removeWhitespace(el) {
  return el.replace(/\s/g, '');
}

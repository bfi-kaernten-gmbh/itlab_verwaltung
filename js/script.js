// get needed modules
var gsheet = require('gsheet-web');
var moment = require('moment');

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
    }
});
calenderTo.attachEvent("onChange", function(date, state){
    //console.log(moment(date).format('YYYY-MM-DD'));
    curTo = findInArray(dataArray, 'datum', moment(date).format('YYYY-MM-DD'));
    //console.log(curTo);

    if(curFrom >= 0 && curTo >= 0 && curFrom <= curTo) {
      updateTrainerTable();
    }
});

// holds trainer names that are selected
var trainer = [];
// holds whole data from google spreadsheet
var dataArray;

// get google spreadsheet data
gsheet('1Qaoq2mNojwEipDDiMnqclSaAgtqmX4XLy7q6659br8U', (data) => {
  console.log(data);
  dataArray = data;
  createOptions(data)
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
    }
    if(trainer.length === 0) {
      removeTrainerContent();
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
    console.log('updateTrainerTable');
    removeTrainerContent()
    for (var i = 0; i < trainer.length; i++) {
      var hoursArray = [];
      for (var c = curFrom; c <= curTo; c++) {

        var start = dataArray[c][trainer[i]+'start'];
        var end = dataArray[c][trainer[i]+'end'];

        if(start && end) {
          hoursArray.push(getHours(start,end));
        }
      }
      //console.log(hoursArray);
      var hoursTotal = getTotalHours(hoursArray);
      var daysCounted = (curTo - curFrom) + 1;
      renderTrainerHours(trainer[i], hoursTotal, daysCounted);
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

  if(result >= 6) {
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

function removeTrainerContent() {
  var tContainer = document.getElementById('trainer-c');
  while (tContainer.lastChild) {
    tContainer.removeChild(tContainer.lastChild);
  }
}

function renderTrainerHours(name, hours, daysCounted) {
  var tContainer = document.getElementById('trainer-c');
  if (isInt(hours)) {
    tContainer.innerHTML += '<div class="trainer" data-clipboard-target="#'+ name +'"> <h3>' + name +'</h3><p class="hours" id="'+ name +'">'+ hours + '</p><p>'+ daysCounted +'</p></div>';
  } else {
    var parsedHours = parseInt(hours),
        parsedMinutes = (hours - parseInt(hours)) * 60;
    tContainer.innerHTML += '<div class="trainer" data-clipboard-target="#'+ name +'"> <h3>' + name +'</h3><p class="hours" id="'+ name +'">'+ parsedHours + ' / ' + parsedMinutes + '</p><p>'+ daysCounted +'</p></div>';
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

var test = '0.5';
console.log(test * 60);

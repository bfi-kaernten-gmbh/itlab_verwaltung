var gsheet = require('gsheet-web');
var moment = require('moment');
var GetSheetDone = require('get-sheet-done');

GetSheetDone.labeledCols('1Qaoq2mNojwEipDDiMnqclSaAgtqmX4XLy7q6659br8U').then(sheet => {
    console.log(sheet)
})

// init calendar
var calenderFrom = new dhtmlXCalendarObject("from");
calenderFrom.setSkin("material");
calenderFrom.setDateFormat("%d.%m.%Y");

var calenderTo = new dhtmlXCalendarObject("to");
calenderTo.setSkin("material");
calenderTo.setDateFormat("%d.%m.%Y");


var curFrom;
var curTo;
// add EventListeners to change
calenderFrom.attachEvent("onChange", function(date, state){
    console.log(moment(date).format('DDD.MM.YYYY'));
    curFrom = findInArray(dataArray, 'datum', moment(date).format('DD.MM.YYYY'));
    console.log(curFrom);
    if(curFrom >= 0 && curTo >= 0) {
      updateTrainerTable();
    }
});

calenderTo.attachEvent("onChange", function(date, state){
    console.log(moment(date).format('DD.MM.YYYY'));
    curTo = findInArray(dataArray, 'datum', moment(date).format('DD.MM.YYYY'));
    console.log(curTo);

    if(curFrom >= 0 && curTo >= 0 ) {
      updateTrainerTable();
    }
});


var trainer = [];
var dataArray;

gsheet('1Qaoq2mNojwEipDDiMnqclSaAgtqmX4XLy7q6659br8U', (data) => {
  console.log(data);
  dataArray = data;
  createOptions(data)
});

function createOptions(data) {
  var options = document.getElementById('options');

  var trainerOptions = document.getElementById('trainer_options');
  var list = getTrainerNames(data);
  for(var i in list) {
    trainerOptions.innerHTML += '<option value='+list[i]+'>' + list[i] + '</option>'
  }

  chosenInit();
}


const chosenInit = () => {
  $(".chosen-select").chosen({no_results_text: "Oops, nothing found!"});
  $('.chosen-select').on('change', function(evt, selected) {
    if(selected.selected) {
      trainer.push(selected.selected);
    } else if(selected.deselected) {
      var index = trainer.indexOf(selected.deselected);
      trainer.splice(index, 1);
    }
  });
}

const getTrainerNames = (data) => {
  var propArray = Object.getOwnPropertyNames(data[0]);
  var trainerList  = [];
  propArray.forEach(function (item) {
    if(item !== "datum" && item.search('gruppe') === -1) {
      trainerList.push(item);
    }
  })
  return trainerList;
}


const updateTrainerTable = () => {
  console.log('updateTrainerTable');
  for (var i = curFrom; i <= curTo; i++) {
    console.log(dataArray[i].datum);
  }

}

const findInArray = (array, attr, value) => {
  for (var i = 0; i < array.length; i++) {
    console.log('momentÄ' + moment(array[i][attr]).format('DD.MM.YYYY'));
    if(array[i][attr] === value) {
      return i;
    }
  }
  return -1;
}

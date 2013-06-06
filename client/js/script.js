/*global io:false, $:false */

'use strict';

var socket = io.connect('http://127.0.0.1:1337');
var isDirty = false;
var activitiesInfo = {};
var defaultActivities = {};
var currentActivities = {};

function showDate(date) {
    console.log('The date chosen is ' + date);

    //load data
    $('#loadInProgressDialog').dialog('open');
    socket.emit('loadData', {date: date});
}

//noinspection JSHint
function makeDirty() {
    isDirty = true;
    $('#saveButton').removeAttr('disabled');
}

function saveData() {
    var date = $('#calendar').datepick('getDate'),
        length = currentActivities.length,
        i,
        $input;

    $('#saveInProgressDialog').dialog('open');
    $('#saveButton').attr('disabled', 'disabled');
    isDirty = false;

    for (i = 0; i < length; i += 1) {
        $input = $('#' + currentActivities[i].id);
        currentActivities[i].completed = $input.prop('checked');
    }

    socket.emit('saveData', {date: date, fields: currentActivities});
}

function getMonthData() {
    var currentDate = new Date($('#calendar').datepick('getDate')),
        currentMonth = currentDate.getMonth() + 1,
        currentYear = currentDate.getFullYear(),
        daysInMonth = $.datepick.daysInMonth(currentYear, currentMonth);

    $('#loadInProgressDialog').dialog('open');
    socket.emit('getMonthData', {year: currentYear, month: currentMonth,
        maxDay: daysInMonth});
}

function saveCompleted(data) {

    $('#saveInProgressDialog').dialog('close');

    if (data.err) {
        var $errorDialog = $('#errorDialog');
        $errorDialog.text(data.err);
        $errorDialog.dialog('open');
    } else {
        getMonthData();
    }
}

function clearTable(table) {
    var count = table.rows.length,
        i;

    for (i = count - 1; i > 0; i -= 1) {
        table.deleteRow(i);
    }
}

function generateTable() {
    var length = currentActivities.length,
        i,
        activity,
        activityInfo,
        tr,
        td,
        input,
        table = document.getElementById('activitiesTable');

    clearTable(table);

    // Add new rows
    for (i = 0; i < length; i += 1) {
        activity = currentActivities[i];
        activityInfo = activitiesInfo[activity.id];

        // Create row
        tr = document.createElement('tr');

        // Create name cell
        td = document.createElement('td');
        td.innerText = activityInfo.Name;
        tr.appendChild(td);

        // Create details cell
        td = document.createElement('td');
        switch (activityInfo.Type) {
        case 'Timer':
            td.innerText = activity.time;
            break;
        case 'Set':
            td.innerText = activity.sets + '*' + activity.amount +
                ' (' + activity.weight + 'kg)';
            break;
        case 'Once':
            break;
        case 'Time':
            td.innerText = activity.time;
            break;
        default:
            console.error('Unknown activity type value: ' + activityInfo.Type);
        }
        tr.appendChild(td);

        // Create completion cell
        td = document.createElement('td');
        input = document.createElement('input');
        input.id = activity.id;
        input.classList.add('data');
        input.type = 'checkbox';
        input.checked = activity.completed;
        input.setAttribute('onchange', 'makeDirty();');
        td.appendChild(input);
        tr.appendChild(td);

        table.appendChild(tr);
    }
}

// http://james.padolsey.com/javascript/deep-copying-of-objects-and-arrays/
function deepCopy(obj) {
    var copy = obj,
        key,
        isArray;

    if (obj && typeof obj === 'object') {
        isArray = Object.prototype.toString.call(obj) === '[object Array]';
        copy = isArray ? [] : {};

        //noinspection JSHint,JSLint
        for (key in obj) {
            //noinspection JSUnfilteredForInLoop
            copy[key] = deepCopy(obj[key]);
        }
    }

    return copy;
}

function updateTable(data) {

    var values = data.values;

    if (!values || 0 === Object.keys(values).length) {
        currentActivities = deepCopy(defaultActivities);
    } else {
        currentActivities = deepCopy(values);
    }

    generateTable();

    $('#loadInProgressDialog').dialog('close');
    getMonthData();
}

function colorCalendar(data) {

    var date = new Date($('#calendar').datepick('getDate')),
        year = date.getFullYear(),
        month = date.getMonth() + 1,
        daysInMonth = $.datepick.daysInMonth(year, month),
        i,
        currentDate,
        newClass,
        oldClass,
        $day;

    for (i = 1; i <= daysInMonth; i += 1) {
        currentDate = $.datepick.newDate(year, month, i);
        newClass = data[i] ? 'datepick-done' : 'datepick-notDone';
        oldClass = data[i] ? 'datepick-notDone' : 'datepick-done';

        $day = $('.dp' + currentDate.getTime());
        $day.addClass(newClass);
        $day.removeClass(oldClass);
    }

    $('#loadInProgressDialog').dialog('close');
}

function handleMonthChange(year, month) {
    $('#calendar').datepick('setDate', new Date(year, month - 1, 1));
}

function handlePreSelection() {
    if (isDirty) {
        alert('Save before picking another date!');
        return false;
    }

    return true;
}

$(function() {
    var $calendar = $('#calendar');
    $calendar.datepick({onSelect: showDate,
        onChangeMonthYear: handleMonthChange,
        onPreSelect: handlePreSelection});

    $('#saveButton').click(saveData);

    $('#saveInProgressDialog').dialog({ autoOpen: false,
        dialogClass: 'no-close',
        modal: true });

    $('#loadInProgressDialog').dialog({ autoOpen: false,
        dialogClass: 'no-close',
        modal: true });

    $('#errorDialog').dialog({ autoOpen: false, modal: true });

    socket.on('saveCompleted', saveCompleted);
    socket.on('data', updateTable);
    socket.on('monthData', colorCalendar);

    // load activities
    $.getJSON('js/activities.json', function(newActivities) {
        activitiesInfo = newActivities;

        $.getJSON('js/defaultActivities.json', function(newDefault) {
            defaultActivities = newDefault;

            // This should be last statement,
            // as it starts sending/receiving events and using DOM
            // and jQuery objects.
            $calendar.datepick('setDate', new Date());

        });
    });
});

/*global io:false, $:false */

'use strict';

var socket = io.connect('http://127.0.0.1:1337');
var isDirty = false;

function showDate(date) {
    console.log('The date chosen is ' + date);

    //load data
    $('#loadInProgressDialog').dialog('open');
    socket.emit('loadData', {date: date});
}

function makeDirty() {
    isDirty = true;
    $('#saveButton').removeAttr('disabled');
}

function saveData() {
    var date = $('#calendar').datepick('getDate'),
        completedObject = {};

    $('#saveInProgressDialog').dialog('open');
    $('#saveButton').attr('disabled', 'disabled');
    isDirty = false;

    $('input.data').each(function() {
        completedObject[$(this).attr('id')] = $(this).prop('checked');
    });

    console.log(completedObject);
    socket.emit('saveData', {date: date, fields: completedObject});
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

function updateTable(data) {

    var values = data.values,
        key;

    if (!values || 0 === Object.keys(values).length) {
        $('input.data').each(function() {
            $(this)[0].checked = false;
        });
    } else {
        for (key in values) {
            if (values.hasOwnProperty(key)) {
                $('#' + key)[0].checked = values[key];
            }
        }
    }

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

    $('#touchTypingCompleted').change(makeDirty);
    $('#pushUpsCompleted').change(makeDirty);
    $('#squatCompleted').change(makeDirty);
    $('#middlePressCompleted').change(makeDirty);
    $('#hyperextensionCompleted').change(makeDirty);
    $('#eveningTeethCleaningCompleted').change(makeDirty);
    $('#sleepCompleted').change(makeDirty);

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

    // This should be last statement,
    // as it starts sending/receiving events and using DOM and jQuery objects.
    $calendar.datepick('setDate', new Date());
});

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

function saveCompleted(data) {

    $('#saveInProgressDialog').dialog('close');

    if (data.err) {
        var $errorDialog = $('#errorDialog');
        $errorDialog.text(data.err);
        $errorDialog.dialog('open');
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
}

$(function() {
    var $calendar = $('#calendar');
    $calendar.datepick({onSelect: showDate});

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

    // This should be last statement,
    // as it starts sending/receiving events and using DOM and jQuery objects.
    $calendar.datepick('setDate', new Date());
});

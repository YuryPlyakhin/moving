var socket = io.connect('http://127.0.0.1:1337');
var isDirty = false;

$(function () {
    $('#calendar').datepick({onSelect: showDate});

    $('#touchTypingCompleted').change(makeDirty);
    $('#pushUpsCompleted').change(makeDirty);
    $('#squatCompleted').change(makeDirty);
    $('#middlePressCompleted').change(makeDirty);
    $('#hyperextensionCompleted').change(makeDirty);
    $('#eveningTeethCleaningCompleted').change(makeDirty);
    $('#sleepCompleted').change(makeDirty);

    $('#saveButton').click(saveData);

    $('#saveInProgressDialog').dialog({ autoOpen: false, dialogClass: 'no-close', modal: true });
    $('#loadInProgressDialog').dialog({ autoOpen: false, dialogClass: 'no-close', modal: true });
    $('#errorDialog').dialog({ autoOpen: false, modal: true });

    socket.on('saveCompleted', saveCompleted);
    socket.on('data', updateTable);

    // This should be last statement, as it starts sending/receiving events and using DOM and jQuery objects.
    $('#calendar').datepick('setDate', new Date());
});

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

function saveData(event) {
    $('#saveInProgressDialog').dialog('open');
    $('#saveButton').attr('disabled', 'disabled');
    isDirty = false;

    var date = $('#calendar').datepick('getDate');
    var completedObject = {};

    $('input.data').each(function (index) {
        completedObject[$(this).attr('id')] = $(this).prop('checked');
    });

    console.log(completedObject);
    socket.emit('saveData', {date: date, fields: completedObject});
}

function saveCompleted(data) {

    $('#saveInProgressDialog').dialog('close');

    if (data.err) {
        $('#errorDialog').text(data.err);
        $('#errorDialog').dialog('open');
    }
}

function updateTable(data) {

    var values = data.values;

    for (var key in values) {
        if (!values.hasOwnProperty(key))
            continue;

        $('#' + key).attr('checked', values[key]);
    }

    $('#loadInProgressDialog').dialog('close');
}
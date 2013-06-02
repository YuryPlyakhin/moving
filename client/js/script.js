var socket = io.connect('http://127.0.0.1:1337');
var isDirty = false;

$(function () {
    $('#calendar').datepick({onSelect: showDate});
    $('#calendar').datepick('setDate', new Date());

    $('#touchTypingCompleted').change(makeDirty);
    $('#pushUpsCompleted').change(makeDirty);
    $('#squatCompleted').change(makeDirty);
    $('#middlePressCompleted').change(makeDirty);
    $('#hyperextensionCompleted').change(makeDirty);
    $('#eveningTeethCleaningCompleted').change(makeDirty);
    $('#sleepCompleted').change(makeDirty);

    $('#saveButton').click(saveData);

    $("#saveInProgressDialog").dialog({ autoOpen: false, dialogClass: 'no-close', modal: true });
    $("#errorDialog").dialog({ autoOpen: false, modal: true });

    socket.on('saveCompleted', saveCompleted);

    //load data from file
});

function showDate(date) {
    console.log('The date chosen is ' + date);
}

function makeDirty() {
    isDirty = true;
    $('#saveButton').removeAttr('disabled');
}

function saveData(event) {
    $("#saveInProgressDialog").dialog('open');
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

    $("#saveInProgressDialog").dialog('close');

    if (data.err) {
        $("#errorDialog").text(data.err);
        $("#errorDialog").dialog('open');
    }
}
$(function () {
    $('#calendar').datepick({onSelect: showDate});

    $('#touchTypingCompleted').change(saveData);
    $('#pushUpsCompleted').change(saveData);
    $('#squatCompleted').change(saveData);
    $('#middlePressCompleted').change(saveData);
    $('#hyperextensionCompleted').change(saveData);
    $('#eveningTeethCleaningCompleted').change(saveData);

    alert(process.version);
    //load data from file
});

function showDate(date) {
    alert('The date chosen is ' + date);
}

function saveData() {
    alert('clicked');
    // check if file exists
    // if file exists
    // read it to the object
    // update it according to the latest change
    // else
    // create new json object
    // save json to file
}
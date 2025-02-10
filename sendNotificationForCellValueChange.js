function sendNotificationForChangesInMultipleRanges() {
  // --- Configuration ---
  var spreadsheetId = "YOUR_SPREADSHEET_ID"; // Replace with your spreadsheet ID
  var sheetName = "Sheet1"; // Replace with your sheet name
  var rangesToCheck = [
    "C4:C5",  // Replace with your actual ranges
    "C7:C9",
    "C11:C11",
    "C13:C13"
  ];
  var labelColumn = 5; // Replace with the column number where the label is

  // Get the spreadsheet and sheet
  var ss = SpreadsheetApp.getActiveSpreadsheet(); //for now using the active sheet. replace it with spredsheetID
  var sheet = ss.getSheetByName(sheetName);

  // Initialize an array to store changed cells from all ranges
  var allChangedCells =[];

  // Loop through each range
  for (var r = 0; r < rangesToCheck.length; r++) {
    var range = sheet.getRange(rangesToCheck[r]);

    // Get the current values
    var currentValues = range.getValues();

    // Get the previous values from PropertiesService (or initialize if not present)
    var propertiesKey = "previousValues_" + r; // Unique key for each range
    var properties = PropertiesService.getDocumentProperties();
    var previousValues = properties.getProperty(propertiesKey);
    if (previousValues) {
      previousValues = JSON.parse(previousValues);
    } else {
      previousValues = currentValues;
      properties.setProperty(propertiesKey, JSON.stringify(currentValues));
      continue; // Skip to the next range if this is the first run
    }

    // Compare current and previous values
    var changedCells =[];
    for (var i = 0; i < currentValues.length; i++) {
      for (var j = 0; j < currentValues[i].length; j++) {
        if (currentValues[i][j]!== previousValues[i][j]) {

          // Get the value from the desired column (e.g., column E)
          var _cell= range.getCell(i + 1, j + 1).getA1Notation();
          var _range = sheet.getRange(_cell);
          var _row = _range.getRow();
          var _label = sheet.getRange(_row, labelColumn).getValue();

          changedCells.push({
            oldValue: previousValues[i][j],
            newValue: currentValues[i][j],
            label: _label 
          });
        }
      }
    }

    // Add the changed cells from this range to the main array
    allChangedCells = allChangedCells.concat(changedCells);

    // Store the current values as previous values for the next run
    properties.setProperty(propertiesKey, JSON.stringify(currentValues));
  }

  // Send a single notification if there are changes in any of the ranges
  if (allChangedCells.length > 0) {
    var message = "The following values have changed in the sheet '" + sheetName + "':\n\n";
    for (var i = 0; i < allChangedCells.length; i++) {
      message += "7dM SLO change: " + allChangedCells[i].oldValue + " -> " + allChangedCells[i].newValue +
                 " (Core Stats Metric: " + allChangedCells[i].label + ")\n";
    }
  // console.log(message);

    // MailApp.sendEmail(
    //   "your_email@example.com", // Replace with your email address
    //   "Values changed in " + sheetName,
    //   message
    // );
  }
}

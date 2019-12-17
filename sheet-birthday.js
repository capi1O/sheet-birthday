// this script is triggered every day https://developers.google.com/apps-script/guides/triggers/installable#time-driven_triggers

function send()
{
	function notifyUser(message)
	{
		Logger.log(message);
	}
	
	function sendTextMessage(phoneNumber, message)
	{
		
		// option 1. POST to a zapier webhook which trigger sending of SMS via SMS by Zapier (only for US and UK numbers)
		// UrlFetchApp.fetch('https://hooks.zapier.com/hooks/catch/xxxxx/yyyyyyy/')

		// option 2. Twilio API : TODO

		// option 3. SMSgateway => android phone : TODO

		return false;
	}
	
	function sendEmail(emailAddress, message)
	{
		MailApp.sendEmail(emailAddress, 'happy birthday', message);
		
		return true;
	}

	var todayDate = new Date();
	var timeZone = AdsApp.currentAccount().getTimeZone();
	var todayDay = Utilities.formatDate(todayDate, timeZone, "dd/MM");
	var todayYear = Utilities.formatDate(todayDate, timeZone, "yyyy");
	
	var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
	var startRow = 2;
	var startColumn = 1; // A
	var lastRow = sheet.getLastRow(); // number of rows to process
	var lastColumn = 9 // I

	// fetch the range of cells from column A to I and row 2 to ...
	var dataRange = sheet.getRange(startRow, startColumn, lastRow, lastColumn + 1);

	// fetch values for each row in the Range.
	var data = dataRange.getValues();
	
	// go through each contact
	for (var i = 0; i < lastRow; ++i)
	{
		var row = data[i];

		var firstName = row[0];
		var lastName = row[1];
		var phoneNumber = row[2];
		var emailAddress = row[3];
		var company = row[4];
		var notes = row[5];
		var birthDate = new Date(row[6]);
		var birthDay = Utilities.formatDate(birthDate, 'Europe/Paris', "dd/MM"); // TODO : check if birthDate is a Date object

		var birthdayMessage = row[7];
		var messageSentIn = row[8];
		
		Logger.log('=========' + firstName + ' ' + lastName + '==========');

		if (birthDay == todayDay)
		{
			Logger.log('it is ' + firstName + ' ' + lastName + '\'s birthday today');

			// check if message has not been already sent (manual safety)
			if (messageSentIn != todayYear)
			{
				// if contact has a phone number => text him
				if (phoneNumber)
				{
					Logger.log(firstName + ' ' + lastName + ' has a phone number');

					var result = sendTextMessage(phoneNumber, birthdayMessage);

					// if SMS successfully sent => mark message sent
					if (result)
					{
						sheet.getRange(startRow + i, 9).setValue(todayYear);
					}
					else notifyUser('could not send SMS to ' + firstName + ' ' +  lastName + ' (' + phoneNumber + ')' );
				}

				// if contact has an email address => email him
				else if (emailAddress)
				{
					Logger.log(firstName + ' ' + lastName + ' has an email address');

					var result = sendEmail(emailAddress, birthdayMessage);

					// if email successfully sent => mark message sent
					if (result)
					{
						sheet.getRange(startRow + i, 9).setValue(todayYear);
					}

					// otherwise report error to user
					else notifyUser('could not send email to ' + firstName + ' ' + lastName + ' (' + emailAddress + ')');
				}

				// if contact has neither => inform user of its birthday
				else
				{
					notifyUser('it is ' + firstName + ' ' +  lastName + '\'s birthday');
				}
			}

			else Logger.log('message already sent to ' + firstName + ' ' + lastName);
		}
		else Logger.log('message already sent to ' + firstName + ' ' + lastName);

		Logger.log('it is not ' + firstName + ' ' + lastName + '\'s birthday today');
	};
};

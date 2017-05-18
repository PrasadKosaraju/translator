//=============================
// Cognitive API Token Setup 
//=============================
var request = require('request');
var urlencode = require('urlencode');
var textLocale;
/*exports.getTextLocale = function (event,next) {
    return new Promise(
        function (resolve, reject) {
            var options = {
                method: 'POST',
                url: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages?numberOfLanguagesToDetect=1',
                body: { documents: [{ id: 'message', text: event.text }]},
                json: true,
                headers: {
                    'Ocp-Apim-Subscription-Key': 'd5f3152f01154f949525845db71c58e4'
                }
            };
            request(options, function (error, response, body) {
                if (error) {
                    reject(error);
                }
                else if (response.statusCode !== 200) {
                    reject(body);
                }
                else {
				if (body.documents && body.documents.length > 0) {
                        var languages = body.documents[0].detectedLanguages;
                        if (languages && languages.length > 0) {
                            event.textLocale = languages[0].iso6391Name;
							console.log('Detected Locale:',event.textLocale);
							//return callback(event.textLocale);
							 resolve(event.textLocale);
							 console.log('Detected Locale:::::::::',event.textLocale);
                        }
                    }
                   
					
                }
            });
        }
    );
};
*/

exports.getTextLocale=function (event,next,callback) {
	console.log('Text entered:',event.text);
	//console.log('Text Locale:',event.textLocale);
		//var urlencodedtext1 = urlencode(text);
            var options = {
                method: 'POST',
                url: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages?numberOfLanguagesToDetect=1',
                body: { documents: [{ id: 'message', text: event.text }]},
                json: true,
                headers: {
                    'Ocp-Apim-Subscription-Key': 'd5f3152f01154f949525845db71c58e4'
                }
            };
            request(options, function (error, response, body) {
				//console.log('options:',options);
                if (!error && body) {
                    if (body.documents && body.documents.length > 0) {
                        var languages = body.documents[0].detectedLanguages;
                        if (languages && languages.length > 0) {
                            event.textLocale = languages[0].iso6391Name;
							textLocale=event.textLocale;
							console.log('Detected Locale:',textLocale);
							return callback(textLocale);
							//console.log('Sent Locale::::',textlocale);
                        }
                    }
                }
				
                //next();
				
            });
        
    }
	
/*exports.getTextLocale=function (text) {
		console.log('Text entered:',text);
		var urlencodedtext1 = urlencode(text);
		console.log('Encoded Text:',urlencodedtext1);
        var options = {
                method: 'POST',
                url: 'https://westus.api.cognitive.microsoft.com/text/analytics/v2.0/languages?numberOfLanguagesToDetect=1',
                body: { documents: [{ id: 'message', text: urlencodedtext1 }]},
                json: true,
                headers: {
                    'Ocp-Apim-Subscription-Key': 'd5f3152f01154f949525845db71c58e4'
                }
            };
            request(options, function (error, response, body) {
                 if (error) {
                       return console.log('Error in Text Analytics:', error);
                    }
                 else if (response.statusCode != 200) {
                      return console.log('Invalid Status Code Returned for Text Analytics code:', response.statusCode);
                    }
				else if(!error && body) {
                    if (body.documents && body.documents.length > 0) {
                        var languages = body.documents[0].detectedLanguages;
                        if (languages && languages.length > 0) {
                            textLocale = languages[0].iso6391Name;
							console.log('ISO Code:', textLocale);
						
                        }
                    }
                }
				return textLocale;
              // next();
				
            });
				//return textLocale;
}*/


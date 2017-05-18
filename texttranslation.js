//=============================
// Cognitive API Token Setup 
//=============================
var request = require('request');
var tokenHandler = require('./tokenHandler');
var urlencode = require('urlencode');
var parseString = require('xml2js').parseString;
var FROMLocale ='en';
tokenHandler.init();
exports.getTextTranslation=function (locale,text,callback) {
	  return new Promise(
        function (resolve, reject) {
	var token = tokenHandler.token();
	//var text="I can help you with food ordering";
        if (token && token !== ""){ //not null or empty string
		    var urlencodedtext = urlencode(text); // convert foreign characters to utf8
	      	var options = {
                method: 'GET',
                url: 'http://api.microsofttranslator.com/v2/Http.svc/Translate'+'?text=' + urlencodedtext + '&from=' + FROMLocale +'&to=' + locale,
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            };
			 request(options, function (error, response, body){
                //Check for error
                if(error){
                    return console.log('Error:', error);
                } else if(response.statusCode !== 200){
                    return console.log('Invalid Status Code Returned:', response.statusCode);
                } else {
                    // Returns in xml format, no json option :(
                    parseString(body, function (err, result) {
                        console.log("Returning result in user language to User::",result.string._);
                         return callback(result.string._);
                    });
                    
                }
            });         
        } else {
            console.log("No token");
            //next();
        }
		}
		)
        
    }
	
	
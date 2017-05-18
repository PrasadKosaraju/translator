var restify = require('restify');
var builder = require('botbuilder');
var request = require('request');
var parseString = require('xml2js').parseString;
var urlencode = require('urlencode');

var tokenHandler = require('./tokenHandler');
var textAnalytics = require('./textAnalytics');
var texttranslation = require('./texttranslation');
//=========================================================
// Bot Setup
//https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/dfe2a8a8-7ea6-4f23-be4b-21c807d2eabf?subscription-key=0577d9ec5d9e4eed979b5524191e0a01&verbose=true&timezoneOffset=0&q=
//=========================================================

// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});
  
// Create chat bot
var connector = new builder.ChatConnector({
       appId: "4bfa426f-140a-4ade-ac06-61db9dde59d7",
    appPassword: "EibAmKxy8f5jphHyEfPGYm2"
});
var bot = new builder.UniversalBot(connector);

server.post('/api/messages', connector.listen());

// Documentation for text translation API here: http://docs.microsofttranslator.com/text-translate.html
//=========================================================
// Bot Translation Middleware
//=========================================================

// Start generating tokens needed to use the translator API
tokenHandler.init();
// Otherwise can use the code for locale detection provided here: https://docs.botframework.com/en-us/node/builder/chat/localization/#navtitle
//var FROMLOCALE = 'zh-CHS'; // Simplified Chinese locale
var FROMLOCALE;
var TOLOCALE = 'en';
bot.use({
    receive: function (event, next) {
		var token = tokenHandler.token();
        if (token && token !== ""){ //not null or empty string
            var urlencodedtext = urlencode(event.text); // convert foreign characters to utf8
	          textAnalytics.getTextLocale(event,next,function(response){
					  console.log("Response",response);
					 
				var options = {
                method: 'GET',
                url: 'http://api.microsofttranslator.com/v2/Http.svc/Translate'+'?text=' + urlencodedtext + '&from=' + response +'&to=' + TOLOCALE,
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
                        console.log("Translating to English::",result.string._);
                        event.text = result.string._;
                        next();
                    });
                    
                }
            });
		}); 
	 } else {
            console.log("No token");
            next();
        }
    }
}); 


//=========================================================
// Bots Dialogs
//=========================================================

var LUISKEY = "0577d9ec5d9e4eed979b5524191e0a01"; // Replace this with your LUIS key as a string
var APPID = "dfe2a8a8-7ea6-4f23-be4b-21c807d2eabf"; // Replace this with your LUIS app id as a string
var recognizer = new builder.LuisRecognizer('https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/dfe2a8a8-7ea6-4f23-be4b-21c807d2eabf?subscription-key=0577d9ec5d9e4eed979b5524191e0a01&timezoneOffset=0&verbose=true&q=');
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
bot.dialog('/', intents);

//Route the luis intents to the various dialogs
//intents.matches(/\b(hello|hi|hey|how are you)\b/i, builder.DialogAction.send('你好。(Hello)'))
intents.matches('Greetings', builder.DialogAction.send('你好。(Hello)'))
    .matches('GetHelp', '/help')
    .matches('GetLocation', '/location')
    .matches('GetFoodPlaces', '/food')
    .matches('GetOpeningHours', '/openinghrs')
    .matches('GetPrice', '/entryfee')
	.matches('UserName Error', '/usererror')
    .onDefault(builder.DialogAction.send('我不懂你在说什么。(I didn\'t understand what you said.)'));
var userLocale;
bot.dialog('/help', function (session) {
    //Send the message back in the foreign dialect to avoid translating back

	userLocale= session.preferredLocale();
	console.log("Session preferred locale",userLocale);
	var text="I can help you with food ordering";
	texttranslation.getTextTranslation(userLocale,text,function(response){
					 // console.log("Translated text",response);
					session.endDialog(response); 
					  
	});
 });
 bot.dialog('/usererror', function (session) {
   var text= " Has an idM request been submitted to gain access to Image Vision.  For further information, reference solution How To Add, Modify, Disable Or Reactivate Access.\n.Use the idM search function to search for Image Vision.";
	userLocale= session.preferredLocale();
	console.log("Session preferred locale",userLocale);
	session.sendTyping();
    texttranslation.getTextTranslation(userLocale,text,function(response){
					 // console.log("Translated text",response);
					 setTimeout(function () {
       session.endDialog(response); 
    }, 2000);
					
					  
	});
 });

bot.dialog('/location', function (session) {
    session.send('Our address is...');
    session.endDialog('我们的地区是。。。'); 
});

bot.dialog('/food', function (session){
    session.send("There's lots you can eat.");
    session.endDialog('有很多可以吃的。');
});

bot.dialog('/openinghrs', [
    function (session, args) {
        // Resolve and store any entities passed from LUIS.
        var dateEntity = builder.EntityRecognizer.findEntity(args.entities, 'builtin.datetime.date');
        if (dateEntity){
            // User specified a date
            var date = new Date(dateEntity.resolution.date);
            // Year parsing is inconsistent so we set the year ourselves if the year parsed is less than the current year (we assume the user wouldn't ask about opening hours of previous years)
            var now = new Date();
            if (date.getFullYear() < now.getFullYear()){
                if (date.getMonth() >= now.getMonth() && date.getDate() >= now.getDate()){
                    // Day/month is either today or later in the year
                    date.setFullYear(now.getFullYear());
                } else {
                    // The day/month is less than the current day/month, meaning user is likely referring to next year
                    date.setFullYear(now.getFullYear() + 1);
                }
            }
            // Check if weekend or weekday
            if (date.getDay() == 6 || date.getDay() == 0){
                session.send('That day is a weekend, so we are open 9-11pm.');
                session.endDialog('那天是周末，所以我们营业时间9-11。');
            } else {
                session.send('We open from 10-4 on that day.');
                session.endDialog('我们那天营业时间10-4。');
            }
        } else {
            // User did not specify a date
            session.send('We open are from 10-4pm on weekdays, and 9-11pm on weekends.');
            session.endDialog('我们平日营业时间10-4pm, 周末营业时间9-11pm.');
        }
    }
]);

bot.dialog('/entryfee', [
    function (session, args){
        // Resolve and store any entities passed from LUIS.
        var personType = builder.EntityRecognizer.findEntity(args.entities, 'PersonType');
        if (personType){
            // User stated child or adult (haven't accounted for both)
            personType = personType.entity;
            if (personType.match(/\b(adult)\w*/i)){
                session.send('Adult entrance fee is $20');
                session.endDialog('大人入门费￥20.');
            } else if (personType.match(/\b(child|kid)\w*/i)){
                session.send('Child entrance fee is $10');
                session.endDialog('小孩入门费￥10.');
            }
        } else {
            // User asked about general entry fee
            session.send('Adult entrance fee is $20, kids entrance fee is $10.');
            session.endDialog('大人入门费￥20，小孩￥10');
        }
    }
]);

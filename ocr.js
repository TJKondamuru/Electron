const request = require('request');
const {returnPromise} = require('./share');
let subscriptionKey='91587b923f804e92a988787e1c0b1f76';
let endpoint = 'https://eventstextreader.cognitiveservices.azure.com/';
let uriBase = endpoint + 'vision/v2.1/ocr';

const imageUrl = 'https://burghindianappf8fdc.blob.core.windows.net/burghindian-files/JET-FULL-74094.jpeg';

// Request parameters.
const params = {
    'language': 'unk',
    'detectOrientation': 'true',
};


function OCRText(imageUrl){
    return returnPromise(
        callback=>{
            let lines = [];
            const options = {
                uri: uriBase,
                qs: params,
                body: '{"url": ' + '"' + imageUrl + '"}',
                headers: {
                    'Content-Type': 'application/json',
                    'Ocp-Apim-Subscription-Key' : subscriptionKey
                }
            };
            request.post(options, (error, response, body) => {
                if(error)
                    callback(error);
                else
                {
                    let js = JSON.parse(body);
                    let k = [];
                    let liner = '';
                    for(let i = 0; i < js.regions.length; i++){
                        for(let ii = 0; ii < js.regions[i].lines.length; ii++){
                            let words = js.regions[i].lines[ii].words;
                            liner = '';
                            for(j = 0; j < words.length; j++)
                                liner = liner + ' ' + words[j].text;
                            lines.push(liner)         
                        }
                        
                    }
                    callback(lines);
                }
                //let jsonResponse = JSON.stringify(JSON.parse(body), null, '  ');
                //console.log(jsonResponse);
            });
    });
    
}
module.exports.OCRText = OCRText;

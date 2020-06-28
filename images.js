const path = require('path');
const fs = require('fs');
const Jimp  = require('jimp');
const request = require('request');


function getFileName(extn){
    return __dirname + '\\files\\' + 'download-' + Math.random().toFixed(5).substring(2) + '.' + extn;
}
function returnPromise(opcode){
    return new Promise((resolve, reject)=>{
        try{
            
            opcode(resolve);
        }
        catch(e){
            reject(e);
            
        }
    });
}
function fileSizeKB(filepath){
    let stats = fs.statSync(filepath);
    let mb = stats.size / (1024 * 1024);
    let kb = stats.size / 1024;
    
    return (mb > 1 ? mb : kb).toFixed(2) + (mb > 1 ? ' mb' : ' kb');
}


function  processImage(filepath, options){
    return returnPromise(
            async callback =>{
            let outpath = getFileName(path.extname(filepath));
            const img = await Jimp.read(filepath);  
            if(options['600w'])
                await img.resize(600, Jimp.AUTO)
            if(options['90p'] || options['80p'] || options['60p'])
                await img.quality(options['90p'] ? 90 :(options['80p'] ? 80 : 60));
            
            await img.write(outpath);
            callback(null, filename);
        }
    );
}



function base64ToImg(data){
    return returnPromise(
        callback=>{
            let semiindex = (data + '').indexOf(';')
            if(semiindex > -1)
            {
                let extn = data.substring(0, semiindex).replace('data:image/', '');
                var base64Data = data.replace(`data:image\/${extn};base64,`, "");
                
                let filename = getFileName(extn);
                fs.writeFile(filename, base64Data, 'base64', err=>{
                    callback(err, filename);
                })
            }
            else
                callback(null, '');
        }
    );
}



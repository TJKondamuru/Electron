const fs = require('fs');
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
function getFileName(extn){
    return __dirname + '\\files\\' + 'download-' + Math.random().toFixed(5).substring(2) + '.' + extn;
}
function sizeKB(size){
    let mb = size / (1024 * 1024);
    let kb = size / 1024;
    
    return (mb > 1 ? mb : kb).toFixed(2) + (mb > 1 ? ' mb' : ' kb');
}
function fileSizeKB(filepath){
    let stats = fs.statSync(filepath);
    let mb = stats.size / (1024 * 1024);
    let kb = stats.size / 1024;
    
    return (mb > 1 ? mb : kb).toFixed(2) + (mb > 1 ? ' mb' : ' kb');
}

module.exports.returnPromise = returnPromise;
module.exports.getFileName = getFileName;
module.exports.fileSizeKB = fileSizeKB;
module.exports.sizeKB = sizeKB;
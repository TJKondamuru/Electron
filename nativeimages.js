const { clipboard, nativeImage} = require('electron');
const {returnPromise,getFileName,fileSizeKB} = require('./share');
const {UploadFile, ListUploadFiles} = require('./filestorage');
const {OCRText} = require('./ocr');

const fs = require('fs');
const request = require('request');
const path = require('path');
const ogs = require('open-graph-scraper');



function getOpenTags(options){
    //6dfd4a93-e501-4abe-b9e7-6296a0483c8a	
    return returnPromise(
        callback=>{
            
            ogs({...options, 'headers': {'user-agent': 'node.js'}}, function (error, results) {
                console.log('error:', error); 
                callback(results);
            });
        }
    );
}

function adjustImage(origpath, options, quality){
    return returnPromise(
        callback=>{
            const img = nativeImage.createFromPath(origpath);
            const newimg = img.resize(options);

            let lsfilename = getFileName('jpeg');
            let siz = newimg.getSize();
            fs.writeFileSync(lsfilename, newimg.toJPEG(isNaN(quality) ? 100 : parseInt(quality, 10)));
            callback({filename:lsfilename, size:fileSizeKB(lsfilename), res:siz.width + 'x' + siz.height, basename:path.basename(lsfilename)});
        }
    );
}

function makeImage(navtiveimg){
    let siz = navtiveimg.getSize();
    let lsfilename = getFileName('jpeg')
    fs.writeFileSync(lsfilename, navtiveimg.toJPEG(100));
    return {filename:lsfilename, size:fileSizeKB(lsfilename), res:siz.width + 'x' + siz.height, basename:path.basename(lsfilename)};
}

function getImage(data, type){
    
    return returnPromise(
        callback=>{
            if(type === 'clip')
                callback(makeImage(clipboard.readImage('clipboard')));
            if(type === 'path')
                callback(makeImage(nativeImage.createFromPath(data)));
            else if(type === 'base64')
                callback(makeImage(nativeImage.createFromDataURL(data)));
            else if(type === "url")
                downloadImg(data).then(downfile=>{
                    if(downfile.indexOf('err:') === -1)
                        callback(makeImage(nativeImage.createFromPath(downfile)));
                    else
                        callback({filename:downfile, size:0, res:'na'});
                })
            else
                callback({filename:'invalid type', size:0, res:'na'});
        }
    )
 }


 function downloadImg(url){
    return returnPromise(
        callback=>{
            const types={
                "image/bmp"		: "bmp",
                "image/gif"		: "gif",
                "image/ief"		: "ief",
                "image/jpeg"	: "jpg",
                "image/svg+xml"	: "svg",
                "image/tiff"	: "tif",
                "image/jpeg"	: "jpeg",
                "image/png"     : "png",
                "undefined"     : ""
            }
            request.head(url, (err, res, body)=>{
                let type = res.headers['content-type'].toLowerCase();
                let extn = Object.keys(types).find(x=>x === type) + '';
                if(extn === 'undefined' || extn.length === 0)
                    callback('err: invalid file type ' + type);
                else
                {
                    let filename = getFileName(types[extn]);
                    let ff = fs.createWriteStream(filename);
                    ff.on('close', ()=>callback(filename))
                    request(url).pipe(ff);
                }
            });
        }
    );
}

/*
 getImage('https://s3.amazonaws.com/pix.iemoji.com/images/emoji/apple/ios-11/256/crayon.png', 'url').then(
    nimg=>navtiveimg(nimg)
 )
*/
 module.exports.nativeImgs = {
    getImage : (data, type)=> getImage(data, type),
    adjustImage : (origpath, options, quality)=>adjustImage(origpath, options, quality),
    getOpenTags : options=>getOpenTags(options),
    UploadFile : (filepath, newname, meta)=>UploadFile(filepath, newname, meta),
    ListUploadFiles : ()=>ListUploadFiles(),
    OCRText    : (imageUrl)=>OCRText(imageUrl)
}
 
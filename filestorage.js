const {azureBlobConfig} = require('./config')
const {returnPromise, sizeKB} = require('./share');
const {
    Aborter,
    BlobURL,
    uploadFileToBlockBlob,
    BlockBlobURL,
    ContainerURL,
    ServiceURL,
    StorageURL,
    SharedKeyCredential
    
  } = require("@azure/storage-blob");
  const path = require('path');
  
  const urlBase = `https://${azureBlobConfig.account}.blob.core.windows.net`;
  const ONE_MINUTE = 60 * 1000;
  const aborter = Aborter.timeout(30 * ONE_MINUTE);
  const containerName = `burghindian-files`;
  
  const sharedKeyCredential = new SharedKeyCredential(azureBlobConfig.account, azureBlobConfig.accountKey);
  const pipeline = StorageURL.newPipeline(sharedKeyCredential);
  const serviceURL = new ServiceURL(urlBase, pipeline);
  const containerURL = ContainerURL.fromServiceURL(serviceURL, containerName);

  function UploadFile(filePath, newName, metadata){
        return returnPromise(
        callback=>{
            

            let fileName = path.basename(newName.length > 0 ? filePath.replace('download', newName) : filePath);
            let blockBlobURL = BlockBlobURL.fromContainerURL(containerURL, fileName);
            
            
            uploadFileToBlockBlob(aborter, filePath, blockBlobURL, {
                metadata:metadata
            }).then(res=>{
                callback(blockBlobURL.url);
            }).catch(err=>callback(JSON.stringify(err)));
        })
  }

  function ListUploadFiles(){
    return returnPromise(
        async callback => {
            const fileObjs = {};
            let index = 0;
            marker = undefined;
            do {
                
                const listBlobsResponse = await containerURL.listBlobFlatSegment(Aborter.none, marker, {include:["metadata"]});
                marker = listBlobsResponse.nextMarker;

                for (const blob of listBlobsResponse.segment.blobItems) {
                    
                    fileObjs[blob.properties.creationTime.getTime()] = {
                        name : blob.name,
                        link: `${urlBase}/${containerName}/${blob.name}`,
                        length:blob.properties.contentLength,
                        size : sizeKB(blob.properties.contentLength),
                        createTime : blob.properties.creationTime.toLocaleDateString() + ' ' + blob.properties.creationTime.toLocaleTimeString(),
                        token: !blob.metadata['token'] ? '' : blob.metadata['token']
                    };
                }
                callback(fileObjs);
            } while (marker);
    });
  }
  /*UploadFile("C:\\Development\\Labs\\burghindian\\admin console\\electron\\files\\download-03584.jpeg","diwali", 
  {token:'event'}
  ).then(url=>console.log(url));*/
  module.exports.UploadFile = UploadFile;
  module.exports.ListUploadFiles = ListUploadFiles;
    

 //ListUploadFiles().then(()=>console.log('done'));

const {firebaseConfig} = require('./config')

const firebase = require('firebase/app');
require('firebase/firestore')
if(firebase.apps.length == 0)
        firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function GetMasterFile(docName){
    const snapshot = await db.collection('app-files').doc(docName).get();
    if(!snapshot.exists) return {};
    return snapshot.data();
}

async function SaveFile(docObj, isEmpty, docName){
    
    if(isEmpty)
        await db.collection('app-files').doc(docName).set(docObj);
    else
    {
        if(!!docObj["isDelete"])
        {
            delete docObj["isDelete"];
            let props = Object.keys(docObj);
            console.log(`deleting ${props.length} entries from ${docName}`);

            const delObj = {};
            for(let i = 0; i < props.length;i++)
                delObj[props[i]] = firebase.firestore.FieldValue.delete();
            //console.log(delObj)
            await db.collection('app-files').doc(docName).update(delObj);
        }
        else
            await db.collection('app-files').doc(docName).update(docObj);

    }
        
}


module.exports.indexActions = {
        AllEntries : async (docName, args)=> await GetMasterFile(docName),
        SaveEntry: async (docName, {newobj, isEmpty})=>{await SaveFile(newobj, isEmpty, docName); return {}},
}


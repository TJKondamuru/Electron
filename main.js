const { app, BrowserWindow, ipcMain } = require('electron');
const {indexActions} = require('./store');
const {nativeImgs} = require('./nativeimages');
const {webScrap} = require('./webscrap')
let win;


function createWindow () {
  
  // Create the browser window.
  
    win = new BrowserWindow({
      width: 1024,
      height: 800,
      webPreferences: {
        nodeIntegration: true
      }
    });
  
    //win.loadFile("ui-build/index.html");
    //win.loadURL("http://localhost:3000/")
    //win.loadURL("https://poweradmin.firebaseapp.com")
    win.loadURL(`file://${__dirname}/build/index.html`);
    // Open the DevTools.
    win.webContents.openDevTools();
    
  
    win.webContents.on('new-window', (e,url)=>{
      e.preventDefault();
      require('electron').shell.openExternal(url);
    });
    // Emitted when the window is closed.
    win.on('closed', () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      win = null
    })
  }

  app.on('ready', createWindow)
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
  
  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  /*const objectmapper = {
    'home-entries' : {method:args=>indexActions.AllEntries, document:'home-entries'},
    'save-home-entry' : {method:indexActions.SaveEntry, document:'home-entries'},
    
    'all-files':{method:indexActions.AllEntries, document:'all-files'},
    'save-all-file' : {method:indexActions.SaveEntry, document:'all-files'}, 

    'house-entries':{method:indexActions.AllEntries, document:'house-entries'},
    'save-house-entry' : {method:indexActions.SaveEntry, document:'house-entries'},
    
  }*/

  const objectmapper = {
    'home-entries' : args=> indexActions.AllEntries('home-entries', args),
    'save-home-entry' : args=>indexActions.SaveEntry('home-entries', args),

    'home-page-entries' : args=> indexActions.AllEntries('home-page-entries', args),
    'save-home-page-entry' : args=>indexActions.SaveEntry('home-page-entries', args),

    'all-files':args=>indexActions.AllEntries('all-files', args),
    'save-all-file':args=>indexActions.SaveEntry('save-all-file', args),

    'house-entries':args=>indexActions.AllEntries('house-entries', args),
    'save-house-entry':args=>indexActions.SaveEntry('house-entries', args),
    
    'comment-list':args=>indexActions.AllEntries('comment-list', args),
    'save-comment-list':args=>indexActions.SaveEntry('comment-list', args),

    'post-list':args=>indexActions.AllEntries('post-list', args),
    'save-post-list':args=>{
      //console.log(args);
      return indexActions.SaveEntry('post-list', args);
    },

    'event-entries':args=>indexActions.AllEntries('event-entries', args),
    'save-event-entry':args=>indexActions.SaveEntry('event-entries', args),
    
    'gallery-entries':args=>indexActions.AllEntries('gallery-entries', args),
    'save-gallery-entry':args=>indexActions.SaveEntry('gallery-entries', args),

    'aboutplaces-entries':args=>indexActions.AllEntries('aboutplaces-entries', args),
    'save-aboutplaces-entries':args=>indexActions.SaveEntry('aboutplaces-entries', args),

    'coupons-entries':args=>indexActions.AllEntries('coupons-entries', args),
    'save-coupons-entries':args=>indexActions.SaveEntry('coupons-entries', args),

    'movies-entries':args=>indexActions.AllEntries('movies-entries', args),
    'save-movies-entries':args=>indexActions.SaveEntry('movies-entries', args),

    'social-group-entries':args=>indexActions.AllEntries('social-entries', args),
    'save-social-group-entries':args=>indexActions.SaveEntry('social-entries', args),

    'article-entries':args=>indexActions.AllEntries('article-entries', args),
    'save-article-entry':args=>indexActions.SaveEntry('article-entries', args),

    'get-native-image':args=>{
        const {url, type} = args;  
        return nativeImgs.getImage(url, type)},
     'adjust-native-image': args=>{
        const {origpath, options, quality} = args;
        return nativeImgs.adjustImage(origpath, options, quality);
     },
     'get-events-og-tags': args=>nativeImgs.getOpenTags(args),
     'upload-file-as-blob':args=>{
        console.log(args)
        const {filepath, newname, meta}   = args;
        console.log(meta)
        return nativeImgs.UploadFile(filepath, newname, meta);
     },
     'list-upload-files':args=>nativeImgs.ListUploadFiles(),
     'ocr-image-entry':args=>{
       const {imageUrl} = args;
       return nativeImgs.OCRText(imageUrl)
     },
     'list-running-movies':()=>webScrap.getMovieList()
  }

  Object.keys(objectmapper).forEach(key=>{
    ipcMain.on(key, (event, args)=>{
      console.log(key);
      objectmapper[key](args).then(data=>{
        event.reply(`${key}-response`, data);  
      }).catch(err=>event.reply(`${key}-response`, {err:err}));
    });
  })

  const appCache = {}

  /*ipcMain.on('get-native-image', (event, args)=>{
    const {url, type} = args;
    nativeImgs.getImage(url, type)
    .then(filedate=>event.returnValue = filedate)
    .catch(err=>event.returnValue={filename:err, size:0, res:'na'});
  });

  ipcMain.on('adjust-native-image', (event, args)=>{
    const {origpath, options, quality} = args;
    event.returnValue = nativeImgs.adjustImage(origpath, options, quality)
  });

  ipcMain.on('get-events-og-tags', (event,args)=>{
    nativeImgs.getOpenTags(args).then(opentags=>event.returnValue = opentags)
    .catch(err=>event.returnValue={success:false, err:err});
  });*/

  ipcMain.on('all-files-key-cache', (event, args)=>{
    if(!appCache['all-files-key-cache'])
    appCache['all-files-key-cache'] = {}

    
    if(Object.keys(args).length > 0)
    {
      const {prop, state} = args;
      appCache['all-files-key-cache'] = {...appCache['all-files-key-cache'], [prop]:state}
    }
    
    event.returnValue = appCache['all-files-key-cache'];
  })
const request = require('request');
const cheerio = require('cheerio');
const {returnPromise} = require('./share');
let page1 = 'https://www.pragathi.com/movies/Indian-movies-in-US-showtimes-tickets-schedules-1/Z15220/';
let page2 = 'https://www.pragathi.com/movies/Indian-movies-in-US-showtimes-tickets-schedules-2/Z15220/'

function groupon(pageurl){
    request.get({
        url:pageurl,
        headers: {'user-agent': 'node.js'},
        agent:false,
        rejectUnauthorized:false
    }, (err, response, body)=>{
        let k = body;
    })
    
}
function getList(pageurl){
    return returnPromise(callback=>{
        request(pageurl, {}, (err, response, body)=>{
            if(!err){
                const shows = {};
                const $ = cheerio.load(body);
                const base = $('.listright.muvilistright');
                base.each((index, ele)=>{
                    const theater = theaterLink=>(theaterLink + '').replace('/movies/Indian-movies-in-', '').replace('-PA-showtimes-tickets-schedules/', '')
                    .replace('-OH-showtimes-tickets-schedules/', '');
                    const addr = addrLink=>(addrLink + '').replace('https://maps.google.com/maps?f=q&hl=en&q=', '');
                    const movieName  = name=> name.split('-')[0].trim();
                    const trimShow = show=>{
                        //return show.trim().replace(/(?:\n|\t)/g, '');
                        let arySplit = show.trim().replace(/(?:\n|\t)/g, '').split(' : ');
                        let firstsplit1 = arySplit[0].trim() + ' : ' + arySplit[1].trim();
                        
                        if(firstsplit1.indexOf('|') === -1)
                        return firstsplit1;

                        let aryShows = firstsplit1.split('|');
                        return aryShows.map(segment=>segment.trim()).join(' | ')
                    }
                    const entry = {
                        thumb : $(ele).find('img').eq(0).attr('src'),
                        heading: movieName($(ele).find('h2').eq(0).text().trim()),
                        theater: theater($(ele).find('a').filter((i,ae)=>!!ae.attribs['href'] && ae.attribs['href'].indexOf('/movies/Indian-movies-in-') > -1).first().attr('href')),
                        showtimes1 : $(ele).find('div.showtime').first().find('p').map((index, show)=>trimShow($(show).text())).toArray(),
                        addr : addr($(ele).find('a').filter((i,ae)=>!!ae.attribs['href'] && ae.attribs['href'].indexOf('maps.google.com') > -1).first().attr('href')),
                    }
                    shows[+new Date()] = entry;
                });
                callback(shows);
            }
            else
            console.log(err)
        });
    });
}

function getMovieList(){

    return returnPromise(async callback=>{
        const pag1 = await getList(page1);
        const pag2 = await getList(page2)
        callback({...pag1, ...pag2})
    })
}

module.exports.webScrap = {
    getMovieList :  getMovieList
}
//groupon('https://www.groupon.com/deals/prince-of-india-restaurant-2')
class BookmarksManager {

    constructor(){

        /* CACHES */
        this._CACHE_latest_usage = {
            enums: { lookup:1, collection:2 },
            data:{
                default:[]
            }
        };
    }

    showBookmarks(){

    }

    setBookmarks(){
        // TODO: confirm message
    }

}

module.exports = new BookmarksManager();

const test_config = require('../require.js');

describe('DataManager.class', function() {
    describe("#setHolder('my_file')", function() {
        it("set a file-only holder", function() {
            DataMgr.setHolder({
                label:'my_file',
                filePath:ConfigMgr.path('latest_lookup'),
                fileType:'text'
            });
            assert.equal(DataMgr.hasData('my_file'),false);
            assert.equal(DataMgr.setHolder('my_file'),true);
        });
    });
});

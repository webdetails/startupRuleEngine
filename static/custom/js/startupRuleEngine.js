;(function(){

    var checkboxAddIn = {
        name: "checkbox",
        label: "ActionCheckbox",
        defaults:{
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/setendpointlistener',
            idxFilename: 3 //column containing the filename
        },

        init: function(){

        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt),
                value = $(tgt).text(),
                $addIn = $('<input type="checkbox"/>').addClass('checkBoxAddIn');
            $addIn.prop('checked', (value.toLowerCase() == "true"));
            $addIn.click(function(){
                var eventName = st.rawData.metadata[st.colIdx]['colName'],
                    endpointName = st.rawData.resultset[st.rowIdx][0],
                    enableEvent = $(tgt).find(':checkbox').prop('checked');

                Dashboards.log("Setting " + eventName +  " of "+endpointName+ ' to ' + enableEvent, 'debug') ;
                //Dashboards.log(JSON.stringify(st));
                // Call the endpoint
                $.ajax(options.url, {
                    dataType: 'json',
                    mimeType: 'application/json; charset utf-8',
                    type: 'POST',
                    data: {
                        paramfilename: st.rawData.resultset[st.rowIdx][options.idxFilename],
                        paramevent: eventName,
                        paramvalue: enableEvent
                    },
                    error: function(){
                        $(tgt).find(':checkbox').prop('checked', !enableEvent);
                    }
                });
            });
            $(tgt).empty().append($addIn);
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(checkboxAddIn));

})();

;(function(){
    var runKettleAddIn = {
        name: "runKettle",
        label: "runKettle",
        defaults:{
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/executeEndpoint',
            idxFilename: 3
        },

        init: function(){

        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);

            var value = $(tgt).text(),
                $addIn = $('<button/>').addClass('runKettleAddIn').text('Run'),
                $text = $('<div />').text(value);
            $addIn.click(function(){
                var endpointName = st.rawData.resultset[st.rowIdx][0];

                Dashboards.log("Running "+endpointName, 'debug') ;
                //Dashboards.log(JSON.stringify(st));
                // Call the endpoint
                $.ajax(options.url, {
                    dataType: 'json',
                    mimeType: 'application/json; charset utf-8',
                    type: 'POST',
                    data: {
                        paramfilename: st.rawData.resultset[st.rowIdx][options.idxFilename]
                    },
                    update: function(){
                        Dashboards.log('The table should be updated...');
                    }
                });
            });
            $(tgt).empty().append($text).append($addIn);
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(runKettleAddIn));

})();


;(function(){
    var expandLogAddIn = { // NOT IMPLEMENTED YET
        name: "expandLog",
        label: "expandLog",
        defaults:{
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/getEndpointLog',
            idxFilename: 3
        },

        init: function(){

        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);

            var value = $(tgt).text();
            var $addIn = $('<button/>').addClass('runKettleAddIn').text('Run'),
                $text = $('<div />').text(value);
            $addIn.click(function(){
                var endpointName = st.rawData.resultset[st.rowIdx][0];

                Dashboards.log("Running "+endpointName, 'debug') ;
                //Dashboards.log(JSON.stringify(st));
                // Call the endpoint
                var url = options.url;
                url += '?paramfilename=' +  st.rawData.resultset[st.rowIdx][options.idxFilename];
                $.ajax(url, {
                    dataType: 'json',
                    mimeType: 'application/json; charset utf-8',
                    type: 'POST',
                    update: function(){
                        Dashboards.log('The table should be updated...');
                    }
                });
            });
            $(tgt).empty().append($text).append($addIn);
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(expandLogAddIn));

})();

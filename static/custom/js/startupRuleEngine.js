;(function(){

    var checkboxAddIn = {
        name: "checkbox",
        label: "ActionCheckbox",
        defaults:{
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/setendpointlistener',
            idxEndpointName:0,
            idxFilename: 3 //column containing the filename
        },

        init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt),
                //value = st.rawData.resultset[st.rowIdx][st.colIdx],
                value = $(tgt).text(),
                $addIn = $('<input type="button"/>').addClass('checkBoxAddIn'),
                //$('<input type="checkbox"/>').addClass('checkBoxAddIn'),
                isChecked = (value.toLowerCase() == "true");
            //$addIn.prop('checked', isChecked);
            $addIn.addClass(isChecked ? 'checked' : 'unchecked');
            $addIn.click(function(){
                var eventName = st.rawData.metadata[st.colIdx]['colName'],
                    endpointName = st.rawData.resultset[st.rowIdx][options.idxEndpointName],
                    currentState =  st.rawData.resultset[st.rowIdx][st.colIdx].toString() == "true"; //$(this).hasClass('checked');
                    //enableEvent = $(tgt).find(':checkbox').prop('checked');

                Dashboards.log("Setting " + eventName +  " of "+endpointName+ ' to ' + (!currentState).toString(), 'debug') ;
                //Dashboards.log(JSON.stringify(st));
                // Call the endpoint
                $.ajax(options.url, {
                    dataType: 'json',
                    mimeType: 'application/json; charset utf-8',
                    type: 'POST',
                    data: {
                        paramfilename: st.rawData.resultset[st.rowIdx][options.idxFilename],
                        paramevent: eventName,
                        paramvalue: !currentState
                    },
                    error: function(){
                        //$tgt.find(':checkbox').prop('checked', currentState);
                        $addIn.removeClass('checked unchecked').addClass(currentState ? 'checked' : 'unchecked');
                    },
                    success: function(){
                        $addIn.removeClass('checked unchecked').addClass(!currentState ? 'checked' : 'unchecked');
                        st.rawData.resultset[st.rowIdx][st.colIdx] = (!currentState).toString();
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
            idxEndpointName:0,
            idxFilename: 3
        },

        init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);

            var value = $(tgt).text(),
                $addIn = $('<button/>').addClass('runKettleAddIn').text(' '),
                $text = $('<span />').text(value);
            $addIn.click(function(){
                var endpointName = st.rawData.resultset[st.rowIdx][options.idxEndpointName];

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
            //$(tgt).append($addIn);
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(runKettleAddIn));

})();

;(function(){
    var myAddIn = {
        name: "executionStatus",
        label: "executionStatus",
        defaults:{
            status : { // [StringDisplayedOnTable, associatedCSSClass]
                'success' : ['Success', 'executionStatusSuccess'],
                'failed' : ['Failed', 'executionStatusFailed']
            }
        },

        init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);
            var execution_result = $tgt.text().trim().toLowerCase();
            if (execution_result in options.status){
                $tgt.empty().text(options.status[execution_result][0]).addClass(options.status[execution_result][1]);
            }
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(myAddIn));

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

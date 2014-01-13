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
                value = st.tableData[st.rowIdx][st.colIdx],
                $addIn = $('<input type="button"/>').addClass('checkBoxAddIn'),
                //$('<input type="checkbox"/>').addClass('checkBoxAddIn'),
                isChecked = (value.toLowerCase() == "true");
            //$addIn.prop('checked', isChecked);
            $addIn.addClass(isChecked ? 'checked' : 'unchecked');
            $addIn.click(function(){
                var eventName = st.category, //st.rawData.metadata[st.colIdx]['colName'],
                    endpointName = st.tableData[st.rowIdx][options.idxEndpointName],
                    currentState =  st.tableData[st.rowIdx][st.colIdx].toString() == "true"; //$(this).hasClass('checked');
                    //enableEvent = $(tgt).find(':checkbox').prop('checked');

                Dashboards.log("Setting " + eventName +  " of "+endpointName+ ' to ' + (!currentState).toString(), 'debug') ;
                //Dashboards.log(JSON.stringify(st));
                // Call the endpoint
                $.ajax(options.url, {
                    dataType: 'json',
                    mimeType: 'application/json; charset utf-8',
                    type: 'POST',
                    data: {
                        paramfilename: st.tableData[st.rowIdx][options.idxFilename],
                        paramevent: eventName,
                        paramvalue: !currentState
                    },
                    error: function(){
                        //$tgt.find(':checkbox').prop('checked', currentState);
                        $addIn.removeClass('checked unchecked').addClass(currentState ? 'checked' : 'unchecked');
                    },
                    success: function(){
                        $addIn.removeClass('checked unchecked').addClass(!currentState ? 'checked' : 'unchecked');
                        st.tableData[st.rowIdx][st.colIdx] = (!currentState).toString();
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
            idxFilename: 3,
            refreshEvent:'refreshEvent'
        },

        init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);

            var $addIn = $('<button/>'),
                $text = $('<span />').text(st.value);
            $addIn.addClass('runKettleAddIn').text(' ');
            $addIn.click(function(){
                var endpointName = st.tableData[st.rowIdx][options.idxEndpointName];

                Dashboards.log("Running "+endpointName, 'debug') ;
                //Dashboards.log(JSON.stringify(st));
                // Call the endpoint
                $.ajax(options.url, {
                    dataType: 'json',
                    mimeType: 'application/json; charset utf-8',
                    type: 'POST',
                    data: {
                        paramfilename: st.tableData[st.rowIdx][options.idxFilename]
                    },
                    success: function(){
                        Dashboards.fireChange(options.refreshEvent);
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
            },
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/getEndpointLog',
            idxFilename: 3
        },

        init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);
            var execution_result = st.value.trim().toLowerCase();
            if (execution_result in options.status){
                //var contents = $('<h3/>').text(options.status[execution_result][0]).addClass(options.status[execution_result][1]);;
                $tgt.empty().text(options.status[execution_result][0]).addClass(options.status[execution_result][1]);
                //$tgt.empty().append(contents);
                if (false){
                $tgt.append($('<div/>').html('Lorem ipsum'));
                $tgt.accordion({
                    collapsible: true
                });
                }
            }
            $tgt.click(function(){
            //var f = (function(){
                var endpointName = st.rawData.resultset[st.rowIdx][0];

                Dashboards.log("Getting log of "+endpointName, 'debug') ;
                //Dashboards.log(JSON.stringify(st));
                // Call the endpoint
                var url = options.url;
                $.ajax(url, {
                    dataType: 'json',
                    mimeType: 'application/json; charset utf-8',
                    type: 'POST',
                    data: {
                        paramfilename: st.tableData[st.rowIdx][options.idxFilename]
                    },
                    success: function(data){
                        //Dashboards.log('The table should be updated...');
                        _.each(data.resultset, function(el){
                            // Insert a marker between different invocations
                            if (el[0].endsWith('BEGIN')){
                                el[0] += '<hr/>';
                            }
                        });
                        var html  =  data.resultset.join('<br/>') || data;
                        Dashboards.fireChange('popupParam', html);
                        $('#popupObj').empty().html(html);
                        render_popupComponent.popup($tgt);
                    },
                    error: function(){
                        $('#popupObj').empty().html('No log was found');
                        render_popupComponent.popup($tgt);
                    }
                });
            });
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

            var $addIn = $('<button/>').addClass('runKettleAddIn').text('Run'),
                $text = $('<div />').text(st.value);
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
                    success: function(data){
                        //Dashboards.log('The table should be updated...');
                        alert(JSON.stringify(data.resultset));
                    }
                });
            });
            $(tgt).empty().append($text).append($addIn);
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(expandLogAddIn));

})();

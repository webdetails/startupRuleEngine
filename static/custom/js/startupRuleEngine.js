;(function(){

    var checkboxAddIn = {
        name: "checkbox0",
        label: "ActionCheckbox",
        defaults:{
            action: {
                queryType: 'cpk',
                pluginId: 'startupRuleEngine',
                endpoint: 'setendpointlistener'
            },
            actionParams: function(tgt, st, options){
                return {
                    paramfilename: st.tableData[st.rowIdx][options.idxFilename],
                    paramevent: st.category,
                    paramvalue: !( st.tableData[st.rowIdx][st.colIdx].toString() == "true" )
                };
            },
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/setendpointlistener',
            idxEndpointName:1,
            idxFilename: 0 //column containing the filename
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
                $addIn = $('<input type="button"/>').addClass('checkBoxAddIn').tipsy(),
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

                //Prepare the entries of the ajax request
                var actionREST = Dashboards.getWebAppPath() +
                        '/plugin/'+options.action.pluginId +
                        '/api/' + options.action.endpoint;

                var actionData = {};
                _.each(options.actionParams, function(value, key){
                    actionData['param' + key] = value;
                });
                var actionSuccessCallback = function(data){
                    options.actionSuccessCallback(data, tgt, st, options);
                };
                var actionFailureCallback = function(data){
                    options.actionSuccessCallback(data, tgt, st, options);
                };
                // Call the endpoint
                $.ajax(actionREST, {
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
        name: "runKettle0",
        label: "runKettle",
        defaults:{
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/executeEndpoint',
            idxEndpointName:1,
            idxFilename: 0,
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
            $(tgt).empty()
                .append($addIn);
                //.append($text);
            //$(tgt).append($addIn);
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(runKettleAddIn));

})();


;(function(){
    var formatLastExecution = {
        name: "formatLastExecution",
        label: "formatLastExecution",
        defaults:{
            idxExecutionTrigger: 9
        },

        init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);

            var html;
            var trigger = st.tableData[st.rowIdx][options.idxExecutionTrigger];
            if (trigger.slice(0,4) == 'Trig'){
                var event = trigger.split('cpk.executeAt')[1].split(' ')[0];
                html = sprintf('at <b>%s</b> at %s', event, st.value);
            } else if (trigger.slice(0,3) == 'Man') {
                html = sprintf('Manually at %s', st.value);
            } else {
               html = st.value;
            }
            $tgt.empty().html(html);
        }

    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(formatLastExecution));

})();


;(function(){
    var myAddIn = {
        name: "executionStatus",
        label: "executionStatus",
        defaults:{
            status : { // [StringDisplayedOnTable, associatedCSSClass]
                'success' : ['Success', 'executionStatusSuccess'],
                'failed' : ['Failed', 'executionStatusFailed'],
                'none' : ['none', 'information']
            },
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/getEndpointLog',
            idxEndpointName:1,
            idxFilename: 0,
            idxResult: 8
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
                $tgt = $tgt.empty()
                    .addClass(options.status[execution_result][1])
                    .append($('<span/>').text(options.status[execution_result][0]));
                    //.text(options.status[execution_result][0]);
            }
        }
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(myAddIn));

})();



;(function(){
    var myAddIn = {
        name: "showLog0",
        label: "showLog",
        defaults:{
            status : { // [StringDisplayedOnTable, associatedCSSClass]
                'success' : ['Success', 'executionStatusSuccess'],
                'failed' : ['Failed', 'executionStatusFailed'],
                'none' : ['none', 'information']
            },
            url:  Dashboards.getWebAppPath() + '/plugin/startupRuleEngine/api/getEndpointLog',
            idxEndpointName:1,
            idxFilename: 0,
            idxResult: 8
        },

        init: function(){
            $.fn.dataTableExt.oSort[this.name+'-asc'] = $.fn.dataTableExt.oSort['string-asc'];
            $.fn.dataTableExt.oSort[this.name+'-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt),
                $tgt = $(tgt);
            var execution_result = st.tableData[st.rowIdx][options.idxResult].trim().toLowerCase();
            if (execution_result in options.status){
                $tgt = $tgt.empty()
                    .addClass(options.status[execution_result][1]);

                var $btn = $('<button/>');
                $btn.click(function(){
                    var endpointName = st.tableData[st.rowIdx][options.idxEndpointName];

                    Dashboards.log("Getting log of "+endpointName, 'debug') ;
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
                            // Insert a marker between different invocations
                            _.each(data.resultset, function(el){
                                if (el[0].endsWith('BEGIN')){
                                    el[0] += '<hr>';
                                }
                            });
                            // Build log html
                            var  html = data.resultset.join('<br>') || data;
                            html.replace('<hr><br>', '<hr>');
                            html = '<h3>'+ endpointName  +'</h3>'
                                + '<div class=\"sre-logs\">'
                                + html
                                + '</div>';
                            Dashboards.fireChange('popupParam', html);

                            $('#popupObj').empty().html(html);
                            var $popup = render_popupComponent.ph;
                            _.each(options.status, function(el){
                                $popup.removeClass(el[1]);
                            });
                            $popup.addClass( options.status[execution_result][1] );;
                            render_popupComponent.popup($tgt);
                        },
                        error: function(){
                            $('#popupObj').empty().html('No log was found');
                            render_popupComponent.popup($tgt);
                        }
                    });
                });
                $tgt.append($btn);
            }
        }
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(myAddIn));

})();


;(function(){
Dashboards.newComponentAddIn = function(name, defaults){
    /* Factory for generating addIns based on CDF components
     *
     */
    var componentAddIn = {
        name: name,
        label: name,
        defaults: $.extend(true, {
            componentType: 'ButtonComponent',
            cssClass: 'myClass',
            actionDefinition: {
                queryType: 'cpk',
                pluginId: '',
                endpoint: ''
            },
            properties: {},
            parameters: function(tgt, st, options){},
            preExecution: function (tgt, st, options){},
            postExecution: function (tgt, st, options){},
            successCallback: function(data, tgt, st, options){},
            failureCallback: function(tgt, st, options){}
        }, defaults),
        init: function(){
            $.fn.dataTableExt.oSort[this.name + '-asc' ] = $.fn.dataTableExt.oSort['string-asc' ];
            $.fn.dataTableExt.oSort[this.name + '-desc'] = $.fn.dataTableExt.oSort['string-desc'];
        },

        implementation: function(tgt, st, opt){
            var options = $.extend(true,{},opt);
            var id = ['actionComponentAddIn', _.uniqueId(), st.rowIdx, st.colIdx].join('_');
            var component = { //$.extend(true, options.properties, {
                type: options.componentType,
                name: '' + id + 'Component',
                htmlObject: id,
                actionDefinition: options.actionDefinition,
                actionParameters: Dashboards.objectToPropertiesArray(options.parameters(tgt, st, options)),
                preExecution: function(){
                    _.bind(options.preExecution, this)(tgt, st, options);
                },
                postExecution: function(){
                    _.bind(options.postExecution, this)(tgt, st, options);
                },
                successCallback: function(data){
                    _.bind(options.successCallback, this)(data, tgt, st, options);
                },
                failureCallback: function(){
                    _.bind(options.failureCallback, this)(tgt, st, options);
                }
            };
            _.each(options.properties, function(value, key){
                component[key] = value;
            });
            $(tgt).attr('id', id).addClass();
            Dashboards.bindControl(component).update();
        }
    };
    Dashboards.registerAddIn("Table", "colType", new AddIn(componentAddIn));
};
})();

Dashboards.newComponentAddIn('runKettle', {
    actionDefinition: {
        queryType: 'cpk',
        pluginId: 'startupRuleEngine',
        endpoint: 'executeendpoint'
    },
    idxFilename: 0, //column containing the filename
    idxEndpointName:1,
    parameters: function(tgt, st, options){
        var r = {
            filename: "'" + st.tableData[st.rowIdx][options.idxFilename]+"'"
        };
        Dashboards.log('Params:  ' +JSON.stringify(r));
        return r;
    },
    successCallback: function(data, tgt, st, options){
        Dashboards.log('Success');
    }
});

Dashboards.newComponentAddIn('checkbox', {
    actionDefinition: {
        queryType: 'cpk',
        pluginId: 'startupRuleEngine',
        endpoint: 'executeendpoint'
    },
    idxFilename: 0, //column containing the filename
    idxEndpointName:1,
    parameters: function(tgt, st, options){
        var r = {
            filename: "'" + st.tableData[st.rowIdx][options.idxFilename]+"'",
            event: st.category,
            value: !this.currentState
        };
        Dashboards.log('Params:  ' +JSON.stringify(r));
        return r;
    },
    preExecution: function (tgt, st, options){
        this.currentState = ( st.tableData[st.rowIdx][st.colIdx].toString() == "true" );
        Dashboards.log(JSON.stringify(_.keys(this)));
        this.buttonStyle = 'classic';
        this.label = '';
        this.expression = function(){
            // update parameters shortly before the server call
            this.actionParameters = Dashboards.objectToPropertiesArray(options.parameters(tgt, st, options));
        };
    },
    postExecution: function (tgt, st, options){
        this.setLabel(' ');
        this.placeholder('button').removeClass('checked unchecked')
            .addClass(this.currentState ? 'checked' : 'unchecked');
    },
    successCallback: function(data, tgt, st, options){
        Dashboards.log('Success');
        this.currentState = !this.currentState; //toggle the button
    }
});



Dashboards.newComponentAddIn("showLog", {
    actionDefinition: {
        queryType: 'cpk',
        pluginId: 'startupRuleEngine',
        endpoint: 'getlogendpoint'
    },
    idxFilename: 0, //column containing the filename
    idxEndpointName:1,
    idxResult: 8,
    parameters: function(tgt, st, options){
        var p = {
            filename: "'" + st.tableData[st.rowIdx][options.idxFilename]+"'"
        };
        Dashboards.log('Params:  ' +JSON.stringify(p));
        return p;
    },
    status : { // [StringDisplayedOnTable, associatedCSSClass]
        'success' : ['Success', 'executionStatusSuccess'],
        'failed' : ['Failed', 'executionStatusFailed'],
        'none' : ['none', 'information']
    },
    postExecution: function(tgt, st, options){
        var $tgt = $(tgt);
        var execution_result = st.tableData[st.rowIdx][options.idxResult].trim().toLowerCase();
        if (execution_result in options.status){
            $tgt = $tgt.addClass(options.status[execution_result][1]);
        }
    },
    successCallback: function(data, tgt, st, options){
        // Insert a marker between different invocations
        _.each(data.resultset, function(el){
            if (el[0].endsWith('BEGIN')){
                el[0] += '<hr>';
            }
        });
        // Build log html
        var  html = data.resultset.join('<br>') || data;
        html.replace('<hr><br>', '<hr>');
        html = '<h3>'+ endpointName  +'</h3>'
            + '<div class=\"sre-logs\">'
            + html
            + '</div>';
        Dashboards.fireChange('popupParam', html);

        $('#popupObj').empty().html(html);
        var $popup = render_popupComponent.ph;
        _.each(options.status, function(el){
            $popup.removeClass(el[1]);
        });
        $popup.addClass( options.status[execution_result][1] );;
        render_popupComponent.popup($tgt);
    },
    failureCallback: function(tgt, st, options){
        $('#popupObj').empty().html('No log was found');
        render_popupComponent.popup($tgt);
    }
});

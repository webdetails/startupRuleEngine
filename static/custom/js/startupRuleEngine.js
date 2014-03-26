var SRE = SRE || {};


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
        html = sprintf('<b>at %s</b> at %s', event, st.value);
      } else if (trigger.slice(0,3) == 'Man') {
        html = sprintf('<b>Manually</b> at %s', st.value);
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
        'none' : ['', 'executionStatusUnknown']
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
      if (!(execution_result in options.status)){
        execution_result = 'none';
      }
      $tgt = $tgt.empty()
        .addClass(options.status[execution_result][1])
        .append($('<div/>').text(options.status[execution_result][0]));
      //.text(options.status[execution_result][0]);

    }
  };
  Dashboards.registerAddIn("Table", "colType", new AddIn(myAddIn));

})();


;(function(){
  SRE.registerComponentAddIn = function(type, subtype, name, defaults){
    /* Generates addIns that wrap CDF components and registers them
     *
     */
    // TODO: consider splitting the function into a wr
    var componentAddIn = {
      name: name,
      label: name,
      defaults: $.extend(true, {}, {
        componentType: 'ButtonComponent',
        actionDefinition: {
          queryType: 'cpk',
          pluginId: '',
          endpoint: ''
        },
        properties: {},
        functions: {}, //  postExecution: function(tgt, st, options){}
        parameters: function(tgt, st, options){}
      }, defaults),
      init: function(){
        $.fn.dataTableExt.oSort[this.name + '-asc' ] = $.fn.dataTableExt.oSort['string-asc' ];
        $.fn.dataTableExt.oSort[this.name + '-desc'] = $.fn.dataTableExt.oSort['string-desc'];
      },

      implementation: function(tgt, st, opt){
        var options = $.extend(true,{},opt);
        var id = [options.componentType, 'AddIn', _.uniqueId(), st.rowIdx, st.colIdx].join('_');
        var component = $.extend(true, options.properties, {
          type: options.componentType,
          name: '' + id + 'Component',
          htmlObject: id,
          actionDefinition: options.actionDefinition,
          actionParameters: Dashboards.objectToPropertiesArray(options.parameters(tgt, st, options))
        });
        _.each(options.functions, function(fn, key){
          component[key] = function(){
            fn.apply(component, _.union([tgt, st, options], arguments));
          };
        });
        $(tgt).attr('id', id);
        Dashboards.bindControl(component).update();
      }
    };
    Dashboards.registerAddIn(type, subtype, new AddIn(componentAddIn));
    //return componentAddIn;
  };
})();

//Dashboards.registerAddIn("Table", "colType", new AddIn(Dashboards.wrapComponentAsAddIn('runKettle', {
//})));

SRE.registerComponentAddIn('Table', 'colType', 'runKettle', {
  actionDefinition: {
    queryType: 'cpk',
    pluginId: 'startupRuleEngine',
    endpoint: 'executeendpoint'
  },
  idxFilename: 0, //column containing the filename
  idxEndpointName:1,
  properties: {
    buttonStyle: 'classic',
    label: ''
  },
  parameters: function(tgt, st, options){
    var r = {
      filename: "'" + st.tableData[st.rowIdx][options.idxFilename]+"'"
    };
    Dashboards.log('Params:  ' +JSON.stringify(r));
    return r;
  },
  functions:{
    expression: function(tgt, st, options) {
      this.disable();
    },
    successCallback: function(tgt, st, options){
      Dashboards.log('Success');
      this.enable();
      Dashboards.fireChange('refreshEvent', $.now());
    },
    failureCallback: function(tgt, st, options){
      this.enable();
    }
  }
});

SRE.registerComponentAddIn('Table', 'colType','checkbox', {
  actionDefinition: {
    queryType: 'cpk',
    pluginId: 'startupRuleEngine',
    endpoint: 'setendpointlistener'
  },
  idxFilename: 0, //column containing the filename
  idxEndpointName:1,
  properties: {
    buttonStyle:'classic',
    label: ''
  },
  parameters: function(tgt, st, options){
    var p = {
      filename: "'" + st.tableData[st.rowIdx][options.idxFilename]+"'",
      event:  "'" +st.category+ "'",
      value: !this.currentState
    };
    // Dashboards.log('Params:  ' +JSON.stringify(p));
    return p;
  },
  functions:{
    expression: function(tgt, st, options) {
      this.actionParameters = Dashboards.objectToPropertiesArray(options.parameters(tgt, st, options));
      this.disable();
    },
    preExecution: function (tgt, st, options){
      this.currentState = ( st.value.toString() == "true" );
      Dashboards.log(JSON.stringify(_.keys(this)));
      // this.buttonStyle = 'classic';
      // this.expression = function(){
      //     // update parameters shortly before the server call
      //     this.actionParameters = Dashboards.objectToPropertiesArray(options.parameters(tgt, st, options));
      //     this.disable();
      // };
    },
    updateCheckbox: function(){
      this.placeholder('button').removeClass('checked unchecked')
        .addClass(this.currentState ? 'checked' : 'unchecked');
    },
    postExecution: function (tgt, st, options){
      this.setLabel(' ');
      this.updateCheckbox();
    },
    successCallback: function(tgt, st, options){
      // Dashboards.log('Success');
      this.currentState = !this.currentState; //toggle the button
      this.updateCheckbox();
      this.enable();
    },
    failureCallback: function(tgt, st, options){
      // Dashboards.log('Failed');
      this.enable();
    }
  }
});



SRE.registerComponentAddIn('Table', 'colType',"showLog", {
  actionDefinition: {
    queryType: 'cpk',
    pluginId: 'startupRuleEngine',
    endpoint: 'getendpointlog'
  },
  idxFilename: 0, //column containing the filename
  idxEndpointName:1,
  idxResult: 8,
  popupComponent: 'render_popupComponent',
  status : { // [StringDisplayedOnTable, associatedCSSClass]
    'success' : ['Success', 'executionStatusSuccess'],
    'failed' : ['Failed', 'executionStatusFailed'],
    'unknown' : ['Unknown', 'executionStatusUnknown']
  },
  properties: {
    buttonStyle:'classic',
    label: ''
  },
  parameters: function(tgt, st, options){
    var p = {
      filename: "'"+st.tableData[st.rowIdx][options.idxFilename]+"'"
    };
    Dashboards.log('Params: '+JSON.stringify(p));
    return p;
  },
  functions:{
    postExecution: function(tgt, st, options){
      var execution_result = st.tableData[st.rowIdx][options.idxResult].trim().toLowerCase();
      if (execution_result in options.status){
        $(tgt).addClass(options.status[execution_result][1]);
      }
    },
    successCallback: function(tgt, st, options, data){
      //var data = arguments[3];
      var endpointName = st.tableData[st.rowIdx][options.idxEndpointName];
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
      var popupComponent = Dashboards.getComponentByName(options.popupComponent);
      popupComponent.placeholder().empty().html(html);
      _.each(options.status, function(el){
        popupComponent.ph.removeClass(el[1]);
      });
      var execution_result = st.tableData[st.rowIdx][options.idxResult].trim().toLowerCase();
      if (!(execution_result in options.status)){
        execution_result = 'unknown';
      }
      popupComponent.ph.addClass( options.status[execution_result][1] );;
      popupComponent.popup($(tgt));
      popupComponent.ph.css({
        bottom: 'auto',
        right: '42px',
        left: 'auto'
      });
    },
    failureCallback: function(tgt, st, options){
      var popupComponent = Dashboards.getComponentByName(options.popupComponent);
      popupComponent.placeholder().empty().html('No log was found');
      popupComponent.popup($(tgt));
    }
  }
});


SRE.AboutHTML = [
  '<h4>Introduction</h4>',
  'The Startup Rule Engine is an application that allows the user to configure Kettle jobs and transformations to be run upon specific events, such as upon session login or server startup.</p>',
  // '<h4>Use cases</h4>',
  // '<ol>',
  // '<li>User wants to read/write a session variable</li>',
  // '<li></li>',
  // '</ol>',
  '<h4>Getting Started</h4>',
  '<ol>',
  '<li>Copy kettle files (jobs or transformations) to the folder <kbd>pentaho-solutions/system/startupRules/rules</kbd>.</li>',
  '<li>Schedule the execution using the main dashboard.</li>',
  '</ol>',
  '<h4>Feedback and Support</h4>',
  'Help us improve this app by <a href="http://redmine.webdetails.org/projects/sre">reporting a bug or suggesting a feature.</a>'
].join('');



/*
 var MarkdownComponent = Unmanaged.extend({
 filename: '/pentaho/api/repos//startupRuleEngine/static/custom/About.md',
 render: function(){

 }
 });
 */

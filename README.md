Startup Rule Engine
=============

The Startup Rule Engine is an application that aims to provide PDI-based alternative to the XActions mechanism and which allows you to:

1. configure Kettle jobs and transformations to be run upon specific events: 
    * session login
    * session logout
    * server startup
2. access to each job/transformation execution log.

# Getting started

Scheduling the execution of your PDI files is easy:

1. place the jobs and transformation you wish to schedule under `pentaho-solutions/system/startupRules/rules`.
2. run the *Startup Rule Engine* from the Tools menu, or launch the application via its REST endpoint: [http://localhost:8080/pentaho/plugin/startupRuleEngine/api/main](http://localhost:8080/pentaho/plugin/startupRuleEngine/api/main)
3. click on the appropriate checkboxes.

That's it!


# Support

Use our [bug tracker](http://redmine.webdetails.org/projects/sre) to report
any issues or suggestions for improvement.
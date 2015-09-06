# AEM Wookie connector tool

This is a project is a connector tool for connecting Adobe experience manager with Apache Wookie.
Apache Wookie is a Java server application that allows you to upload and deploy widgets for your applications.
This tool allows AEM users to use Apache wookie to fetch & display widgets hosted on the apache wookie server.
Widgets can not only include all the usual kinds of mini-applications, badges, and gadgets, but also fully-collaborative
 applications such as chats, quizzes, and games.

Here is the link that explains more : [AEM-WookieConnector](http://ankit-gubrani.github.io/AEM-WookieConnector/#/)

## Modules

The main parts of the template are:

* core: Java bundle containing all core functionality like OSGi AEM-Wookie connector services,
        AEM-Wookie client and AEM-Wookie servlet.
* ui.apps: contains the /apps (and /etc) parts of the project, ie JS&CSS clientlibs, components, templates, runmode specific configs as well as Hobbes-tests
* ui.content: contains sample content using the components from the ui.apps
* ui.tests: Java bundle containing JUnit tests that are executed server-side. This bundle is not to be deployed onto production.
* ui.launcher: contains glue code that deploys the ui.tests bundle (and dependent bundles) to the server and triggers the remote JUnit execution

## How to build

To build all the modules run in the project root directory the following command with Maven 3:

    mvn clean install

If you have a running AEM instance you can build and package the whole project and deploy into AEM with  

    mvn clean install -PautoInstallPackage
    
Or to deploy it to a publish instance, run

    mvn clean install -PautoInstallPackagePublish
    
Or to deploy only the bundle to the author, run

    mvn clean install -PautoInstallBundle


# Authors

### **_Ankit gubrani_**

Contact Info :

* [LinkedIn](https://in.linkedin.com/pub/ankit-gubrani/74/a75/56b "Ankit Gubrani")
* [Twitter](https://twitter.com/ankitgubrani90)
* [Blog](http://codebrains.blogspot.in/)
* [Slideshare](http://www.slideshare.net/ankitgubrani/)
* [Site](http://www.codebrains.co.in/ankitgubrani)

### **_Rima Mittal_**

Contact Info :

* [LinkedIn](https://in.linkedin.com/pub/rima-mittal/13/92/501 "Rima Mittal")
* [Twitter](https://twitter.com/rimamittal)
* [Blog](http://rimamittal.blogspot.in/)



new hobs.TestSuite("wookie-aem Tests", {path:"/apps/wookie-aeml/tests/SampleTests.js", register: true})

    .addTestCase(new hobs.TestCase("Hello World component on english page")
        .navigateTo("/content/wookie-aem/en.html")
        .asserts.location("/content/wookie-aem/en.html", true)
        .asserts.visible(".helloworld", true)
    )

    .addTestCase(new hobs.TestCase("Hello World component on french page")
        .navigateTo("/content/wookie-aem/fr.html")
        .asserts.location("/content/wookie-aem/fr.html", true)
        .asserts.visible(".helloworld", true)
    );

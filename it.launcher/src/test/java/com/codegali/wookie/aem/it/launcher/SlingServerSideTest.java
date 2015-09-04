/*
 * AEM-Wookie Connector tool
 */
package com.codegali.wookie.aem.it.launcher;

import static org.junit.Assert.assertEquals;

import org.apache.sling.junit.remote.testrunner.SlingRemoteTestParameters;
import org.apache.sling.junit.remote.testrunner.SlingRemoteTestRunner;
import org.apache.sling.junit.remote.testrunner.SlingTestsCountChecker;
import org.junit.runner.RunWith;

/** Run some server-side tests using the Sling JUnit servlet */
@RunWith(SlingRemoteTestRunner.class)
public class SlingServerSideTest extends SlingServerSideTestsBase 
implements SlingRemoteTestParameters, SlingTestsCountChecker {
    
    public static final String TEST_SELECTOR = "com.codegali.wookie.aem.it.tests";
    public static final int TESTS_AT_THIS_PATH = 1;
    
    public void checkNumberOfTests(int numberOfTestsExecuted) {
        assertEquals(TESTS_AT_THIS_PATH, numberOfTestsExecuted);
    }
    
    public String getJunitServletUrl() {
        return getServerBaseUrl() + SLING_JUNIT_SERVLET_PATH;
    }

    public String getTestClassesSelector() {
        return TEST_SELECTOR;
    }

    public String getTestMethodSelector() {
        return null;
    }
}
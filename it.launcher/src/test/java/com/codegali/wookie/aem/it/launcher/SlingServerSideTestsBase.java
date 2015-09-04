/*
 *  AEM-Wookie Connector tool
 */
package com.codegali.wookie.aem.it.launcher;

import static org.junit.Assert.fail;

import org.apache.sling.testing.tools.http.RequestExecutor;
import org.apache.sling.testing.tools.http.RetryingContentChecker;
import org.apache.sling.testing.tools.sling.SlingClient;
import org.apache.sling.testing.tools.sling.SlingTestBase;
import org.apache.sling.testing.tools.sling.TimeoutsProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/** Test server-side tests using the Sling JUnit servlet, as opposed
 *  to the plain JUnit servlet.
 * TODO
 * TODO Replace this with helper class instead of copying!
 * TODO
 */
public class SlingServerSideTestsBase extends SlingTestBase {
    /** Path to node that maps to Sling JUnit servlet */
    public static final String SERVLET_NODE_PATH =  "/test/sling/" + System.currentTimeMillis();
    
    /** Path used to request the Sling JUnit servlet */
    public static final String SLING_JUNIT_SERVLET_PATH = SERVLET_NODE_PATH + ".junit";
    
    private final Logger log = LoggerFactory.getLogger(getClass());
    private static boolean servletCheckFailed;
    private static boolean servletOk;
    private static boolean servletNodeCreated;
    
    /** Before running tests, setup a node that gives access to the Sling JUnit servlet,
     *  and check (with timeout) that the servlet is ready */
    public SlingServerSideTestsBase() {
        if(!servletNodeCreated) {
            final SlingClient slingClient = new SlingClient(getServerBaseUrl(), getServerUsername(), getServerPassword());
            try {
                slingClient.createNode(SERVLET_NODE_PATH, "sling:resourceType", "sling/junit/testing");
                servletNodeCreated = true;
            } catch(Exception e) {
                fail("Exception while setting up Sling JUnit servlet: " + e);
            }
        }
        
        if(servletCheckFailed) {
            fail(SLING_JUNIT_SERVLET_PATH + " check failed previously, cannot run tests");
        }
        
        if(!servletOk) {
            final RetryingContentChecker servletChecker = new RetryingContentChecker(getRequestExecutor(), getRequestBuilder(),
                    getServerUsername(), getServerPassword())
            {
                @Override
                public void onTimeout() {
                    servletCheckFailed = true;
                }
                
                @Override
                protected boolean assertMore(RequestExecutor e) throws Exception {
                    e.assertContentContains("SlingJUnitServlet");
                    return true;
                }
            };

            final String path = SLING_JUNIT_SERVLET_PATH;
            final int status = 200;
            final int timeout = TimeoutsProvider.getInstance().getTimeout(30);
            final int intervalMsec = TimeoutsProvider.getInstance().getTimeout(500);
            log.info("Checking that {} returns status {}, timeout={} seconds",
                    new Object[] { path, status, timeout });
            servletChecker.check(path, status, timeout, intervalMsec);
            servletOk = true;
            log.info("{} is ready, returns expected content", path);
        }
    }
}

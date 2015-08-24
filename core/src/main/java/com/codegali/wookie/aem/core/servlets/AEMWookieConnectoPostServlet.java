package com.codegali.wookie.aem.core.servlets;


import com.codegali.wookie.aem.core.services.WookieService;
import com.codegali.wookie.aem.core.util.ApplicationConstants;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.sling.SlingServlet;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@SlingServlet(paths = {"/bin/post/aem-wookie"}, methods = {"POST", "GET"}, generateComponent = false,
        selectors = {"widgets", "widgetinstances", "participants"})
@Component(label = "AEM - Wookie connector POST servlet", description = "", enabled = true, immediate = true)
public class AEMWookieConnectoPostServlet extends SlingAllMethodsServlet {

    private static final Logger LOGGER = LoggerFactory.getLogger(AEMWookieConnectorGetServlet.class);

    @Reference
    private WookieService wookieService;

    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws javax.servlet.ServletException, java.io.IOException {
        doPost(request, response);
    }


    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws javax.servlet.ServletException, java.io.IOException {
        JSONObject responseJsonObject = new JSONObject();
        if (request.getRequestPathInfo().getSelectors().length > 0) {

            String firstSelector = request.getRequestPathInfo().getSelectors()[0];

            if (firstSelector.equals(ApplicationConstants.WIDGETS_SELECTOR)) {

            } else if (firstSelector.equals(ApplicationConstants.WIDGET_INSTANCES_SELECTOR)) {

            } else if (firstSelector.equals(ApplicationConstants.PARTICIPANT_SELECTOR)) {
                //Call wookieService.getParticipants(); method here along with required parameters.

                String participantId = request.getParameter(ApplicationConstants.PARTICIPANT_ID_QUERY_PARAM);
                String participantDisplayName = request.getParameter(ApplicationConstants.PARTICIPANT_DISP_NAME_QUERY_PARAM);
                String participantThumbnailUrl = request.getParameter(ApplicationConstants.PARTICIPANT_THUMBNAIL_URL_QUERY_PARAM);
                String instanceIdKey = request.getParameter(ApplicationConstants.WIDGET_INSTANCE_ID_KEY);

                LOGGER.info("Callign add participants method in the wookie"+participantId);
                LOGGER.info("Callign add participants method in the wookie"+participantDisplayName);
                LOGGER.info("Callign add participants method in the wookie"+participantThumbnailUrl);
                LOGGER.info("Callign add participants method in the wookie"+instanceIdKey);

                wookieService.addParticipants(participantId, participantDisplayName, participantThumbnailUrl, instanceIdKey);
            } else if (firstSelector.equals(ApplicationConstants.PROPERTIES_SELECTOR)) {
                //Call wookieService.getProperties(); method here along with required parameters.
            }

            if(!responseJsonObject.toString().equals(ApplicationConstants.BLANK_JSON_OBJECT)) {
                response.getWriter().println(responseJsonObject);
            }
        }
    }
}

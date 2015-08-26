/**
 *
 * Copyright 2015 Ankit Gubrani & Rima mittal
 *
 **/
package com.codegali.wookie.aem.core.servlets;

import com.codegali.wookie.aem.core.services.WookieService;
import com.codegali.wookie.aem.core.util.ApplicationConstants;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.felix.scr.annotations.sling.SlingServlet;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingAllMethodsServlet;
import org.json.JSONException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Servlet that returns response from Wookie server. Different selectors are exposed to perform
 * various operations in the wookie server. For instance :
 * GET request with widgets selector :          returns list of all the widgets hosted in the wookie server.
 * GET request with widgetinstances selector :  returns the information of given widget instance.
 * POST request with widgetinstances selector :  creates a widget instance of a given widget id and user id.
 */
@SlingServlet(paths = {"/bin/aem-wookie"}, methods = {"GET", "POST"}, label = "AEM - Wookie connector GET servlet",
        description = "", generateComponent = false, selectors = {"widgets", "widgetinstances", "participants"})
@Component(enabled = true, immediate = true, metatype = false, label = "AEM - Wookie connector GET servlet")
@Service(AEMWookieConnectorServlet.class)
public class AEMWookieConnectorServlet extends SlingAllMethodsServlet {

    private static final Logger LOGGER = LoggerFactory.getLogger(AEMWookieConnectorServlet.class);

    @Reference
    private WookieService wookieService;

    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws javax.servlet.ServletException, java.io.IOException {
        JSONObject responseJsonObject = new JSONObject();
        if (request.getRequestPathInfo().getSelectors().length > 0) {

            String firstSelector = request.getRequestPathInfo().getSelectors()[0];

            if (firstSelector.equals(ApplicationConstants.WIDGETS_SELECTOR)) {
                responseJsonObject = wookieService.getWidgets();
            } else if (firstSelector.equals(ApplicationConstants.WIDGET_INSTANCES_SELECTOR)) {
                String widgetId = request.getParameter(ApplicationConstants.WIDGET_ID_QUERY_PARAM);
                String userId = request.getParameter(ApplicationConstants.USER_ID_QUERY_PARAM);

                if (widgetId != null && userId!= null && (!"".equals(widgetId)) && (!"".equals(userId))) {
                    LOGGER.info("widgetId - "+widgetId);
                    LOGGER.info("userId - "+userId);
                    responseJsonObject = wookieService.getWidgetInstance(widgetId, userId);
                } else {
                    response.setContentType("text/html");
                    response.getWriter().println("Please provide following query parameters to get <b>widgetintance</b> : " +
                            "<br>1) <b>widgetid</b> - <i>The URI of the widget this is an instance of </i>" +
                            "<br>2) <b>userid</b> - <i>An identifier (typically a hash rather than a real user Id) " +
                            "issued by an application representing the current viewer of the widget instance<i>");
                }
            } else if (firstSelector.equals(ApplicationConstants.PARTICIPANT_SELECTOR)) {
                //Call wookieService.getParticipants(); method here along with required parameters.
            } else if (firstSelector.equals(ApplicationConstants.PROPERTIES_SELECTOR)) {
                //Call wookieService.getProperties(); method here along with required parameters.
            }

            if(!responseJsonObject.toString().equals(ApplicationConstants.BLANK_JSON_OBJECT)) {
                response.getWriter().println(responseJsonObject);
            }
        } else {
            response.setContentType("text/html");
            response.getWriter().println("Please provide a <u><b>selector</b></u> : <br> 1) <b>widgets</b> - " +
                    "For getting widgets. <br> 2) <b>widgetinstances</b> - For getting a specific widget intance " +
                    "(<i>Widget ID</i> and <i>User ID</i> is <u>required</u>). <br> 3) <b>participants</b> - For " +
                    "getting the participants. <br> 4) <b>properties</b> - For getting the properties.");
        }
    }

    @Override
    protected void doPost(SlingHttpServletRequest request, SlingHttpServletResponse response) throws javax.servlet.ServletException, java.io.IOException {
        JSONObject responseJsonObject = new JSONObject();
        try {
            JSONObject responseObject = new JSONObject();
            if (request.getRequestPathInfo().getSelectors().length > 0) {

                String firstSelector = request.getRequestPathInfo().getSelectors()[0];

                if (firstSelector.equals(ApplicationConstants.WIDGETS_SELECTOR)) {

                } else if (firstSelector.equals(ApplicationConstants.WIDGET_INSTANCES_SELECTOR)) {
                    String userId = request.getParameter(ApplicationConstants.USER_ID_QUERY_PARAM);
                    String widgetId = request.getParameter(ApplicationConstants.WIDGET_ID_QUERY_PARAM);

                    if(!"".equals(userId) && !"".equals(widgetId)) {
                        responseJsonObject = wookieService.createWidgetInstance(userId, widgetId);
                    } else {
                        responseJsonObject.put(ApplicationConstants.RESPONSE_JSON_STATUS, "Please provide required query params : userid and widgetid");
                    }

                } else if (firstSelector.equals(ApplicationConstants.PARTICIPANT_SELECTOR)) {
                    //Adding given user as a participant for a widget instance (Widget ID required).
                    String participantId = request.getParameter(ApplicationConstants.PARTICIPANT_ID_QUERY_PARAM);
                    String participantDisplayName = request.getParameter(ApplicationConstants.PARTICIPANT_DISP_NAME_QUERY_PARAM);
                    String participantThumbnailUrl = request.getParameter(ApplicationConstants.PARTICIPANT_THUMBNAIL_URL_QUERY_PARAM);
                    String widgetId = request.getParameter(ApplicationConstants.WIDGET_ID_QUERY_PARAM);
                    String userId = request.getParameter(ApplicationConstants.USER_ID_QUERY_PARAM);
                    String participantRole = request.getParameter(ApplicationConstants.PARTICIPANT_ROLE_QUERY_PARAM);
                    String instanceId = request.getParameter(ApplicationConstants.WIDGET_INSTANCE_ID_KEY);

                    if(participantId != null && !"".equals(participantId) && participantDisplayName != null &&
                            !"".equals(participantDisplayName) && participantThumbnailUrl != null && !"".equals(participantThumbnailUrl)
                            && widgetId!= null && !"".equals(widgetId) && userId!= null && !"".equals(userId)
                            && participantRole!= null && !"".equals(participantRole)) {
                        responseJsonObject = wookieService.addParticipants(participantId, participantDisplayName, participantThumbnailUrl,
                                widgetId, userId, participantRole, instanceId);
                    } else {
                        responseJsonObject.put(ApplicationConstants.RESPONSE_JSON_STATUS, "Reqired query parameters not supplied : " +
                                "userid widgetid participant_role participant_display_name participant_id participant_thumbnail_url");
                    }
                } else if (firstSelector.equals(ApplicationConstants.PROPERTIES_SELECTOR)) {
                    //Call wookieService.getProperties(); method here along with required parameters.
                    // -------------- Properties ------------------
                }

                if(responseJsonObject!= null && !responseJsonObject.toString().equals(ApplicationConstants.BLANK_JSON_OBJECT)) {
                    response.getWriter().println(responseJsonObject);
                }
            } else {
                responseObject.put(ApplicationConstants.RESPONSE_JSON_STATUS, "No selector provided");
            }
        } catch (JSONException e) {
            LOGGER.error("JSONException occurred in ");
        }
    }
}

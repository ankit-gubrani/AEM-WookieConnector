/**
 *
 * AEM-Wookie Connector tool
 * Copyright 2015 Ankit Gubrani & Rima mittal
 *
 **/
package com.codegali.wookie.aem.core.services.impl;

import com.codegali.wookie.aem.core.client.WookieClient;
import com.codegali.wookie.aem.core.services.ServerConfigurationsService;
import com.codegali.wookie.aem.core.services.WookieService;
import com.codegali.wookie.aem.core.util.ApplicationConstants;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service(WookieService.class)
@Component(label = "Wookie service", description = "This service acts as a interface to interact with Wookie server and " +
        "perform varios operations exposed by wookie server from AEM.",
        enabled = true, immediate = true)
public class WookieServiceImpl implements WookieService {

    @Reference
    private ServerConfigurationsService configurationsService;

    private static final Logger LOGGER = LoggerFactory.getLogger(WookieServiceImpl.class);

    @Override
    public JSONObject getWidgetInstance(final String widgetId, final String userId) {
        final String API_URL = "/widgetinstances";
        JSONObject responseJSON = null;

        try {
            WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                    configurationsService.getApiKey());

            //Query parameters do not need to start with '?'
            String queryParams = ApplicationConstants.USER_ID_QUERY_PARAM + "=" + userId + "&" +
                    ApplicationConstants.WIDGET_ID_QUERY_PARAM + "=" + widgetId + "&" + ApplicationConstants.FORMAT_QUERY_PARAM
                    + "=" + "json";

            Map<String, String> responseMap = wookieClient.makeGetRequest(API_URL, queryParams);

            responseJSON = getResponseJson(responseMap);
        } catch (Exception e) {
            LOGGER.error("Exception occurred while getting widget instance : ", e);
        }
        return responseJSON;
    }

    @Override
    public JSONObject createWidgetInstance(final String userId, final String widgetId, final String sharedDataKey) {
        final String API_URL = "/widgetinstances";

        JSONObject responseJSON = null;
        try {
            WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                    configurationsService.getApiKey());

            List<NameValuePair> postQueryParams = new ArrayList<NameValuePair>();

            LOGGER.info("used Id --" + userId);
            LOGGER.info("WIdget ID" + widgetId);

            postQueryParams.add(new BasicNameValuePair(ApplicationConstants.WIDGET_ID_QUERY_PARAM, widgetId));
            postQueryParams.add(new BasicNameValuePair(ApplicationConstants.USER_ID_QUERY_PARAM, userId));
            postQueryParams.add(new BasicNameValuePair(ApplicationConstants.SHARED_DATA_QUERY_PARAM, sharedDataKey));

            Map<String, String> responseMap = wookieClient.makePostRequest(API_URL, postQueryParams);

            responseJSON = getResponseJson(responseMap);
        } catch (Exception e) {
            LOGGER.error("Exception occured while creating widget instance in WookieServiceImpl : ", e);
        }
        return responseJSON;
    }

    @Override
    public void updateInstances() {
        final String API_URL = "/widgetinstances";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());
    }

    @Override
    public JSONObject getWidgets() {
        final String API_URL = "/widgets";
        JSONObject responseJSON = null;
        try {
            WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                    configurationsService.getApiKey());
            Map<String, String> responseMap = wookieClient.makeGetRequest(API_URL, "");
            responseJSON = getResponseJson(responseMap);
        } catch (Exception e) {
            LOGGER.error("Exception occurred while getting widgets ", e);
        }
        return responseJSON;
    }

    @Override
    public void addWidget() {
        final String API_URL = "/widgets";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    @Override
    public void updateWidgets() {
        final String API_URL = "/widgets";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    @Override
    public void deleteWidgets() {
        final String API_URL = "/widgets";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    @Override
    public void getParticipants() {
        final String API_URL = "/participants";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());


    }

    @Override
    public JSONObject addParticipants(final String participantID, final String participantDisplayName, final String participantThumbnailUrl,
                                      final String widgetId, final String userId, final String participantRole, final String instanceId) {
        final String API_URL = "/participants";
        JSONObject responseJSON = null;

        LOGGER.info(" Wookie service : addParticipants method called ");

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

        List<NameValuePair> postQueryParams = new ArrayList<NameValuePair>();

        postQueryParams.add(new BasicNameValuePair(ApplicationConstants.PARTICIPANT_ID_QUERY_PARAM, participantID));
        postQueryParams.add(new BasicNameValuePair(ApplicationConstants.PARTICIPANT_DISP_NAME_QUERY_PARAM, participantDisplayName));
        postQueryParams.add(new BasicNameValuePair(ApplicationConstants.PARTICIPANT_THUMBNAIL_URL_QUERY_PARAM, participantThumbnailUrl));
        //postQueryParams.add(new BasicNameValuePair(ApplicationConstants.WIDGET_ID_QUERY_PARAM, widgetId));
        postQueryParams.add(new BasicNameValuePair(ApplicationConstants.USER_ID_QUERY_PARAM, userId));
        postQueryParams.add(new BasicNameValuePair(ApplicationConstants.PARTICIPANT_ROLE_QUERY_PARAM, participantRole));
        postQueryParams.add(new BasicNameValuePair(ApplicationConstants.WIDGET_INSTANCE_ID_KEY, instanceId));

        Map<String, String> responseMap = wookieClient.makePostRequest(API_URL, postQueryParams);
        responseJSON = getResponseJson(responseMap);

        return responseJSON;
    }


    @Override
    public void deleteParticipant() {
        final String API_URL = "/participants";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    @Override
    public void getProperties() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    @Override
    public void addProperty() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    @Override
    public void updateProperty() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    @Override
    public void deleteProperty() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey());

    }

    private JSONObject getResponseJson(Map<String, String> responseMap) {

        JSONObject responseJSON = null;
        try {
            if (responseMap != null) {
                if (responseMap.containsKey(ApplicationConstants.RESPOSE_STATUS_CODE) && (responseMap.get(ApplicationConstants.RESPOSE_STATUS_CODE).equals("404") ||
                        responseMap.get(ApplicationConstants.RESPOSE_STATUS_CODE).equals(ApplicationConstants.RESPONSE_SERVER_NOT_WORKING_STATUS_CODE))) {
                    responseJSON = new JSONObject();
                    responseJSON.put(ApplicationConstants.IS_SERVER_RUNNING_RESPONSE_KEY, false);
                    responseJSON.put(ApplicationConstants.AEM_RESPONSE_MESSAGE_KEY, responseMap.get(ApplicationConstants.RESPONSE_KEY));
                    responseJSON.put(ApplicationConstants.RESPOSE_STATUS_CODE, responseMap.get(ApplicationConstants.RESPOSE_STATUS_CODE));
                } else {
                    LOGGER.info("Response " + responseMap.get(ApplicationConstants.RESPONSE_KEY));
                    LOGGER.info("Format " + responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY));

                    if (responseMap.containsKey(ApplicationConstants.RESPONSE_FORMAT_KEY) && !responseMap.get(ApplicationConstants.RESPONSE_KEY).equals(ApplicationConstants.INVALID_CONFIG_RESPONSE_STATUS)) {
                        if (responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY).contains(ApplicationConstants.XML_CONTENT_TYPE_RESPONSE)) {
                            responseJSON = XML.toJSONObject(responseMap.get(ApplicationConstants.RESPONSE_KEY));

                            LOGGER.info("Final JSON Object : -------" + responseJSON);
                        } else if (responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY).contains(ApplicationConstants.JSON_CONTENT_TYPE_RESPONSE)) {
                            responseJSON = new JSONObject(responseMap.get(ApplicationConstants.RESPONSE_KEY));
                        }
                    } else {
                        responseJSON = new JSONObject();
                        responseJSON.put(ApplicationConstants.INVALID_CONFIG_RESPONSE_KEY, false);
                        responseJSON.put(ApplicationConstants.AEM_RESPONSE_MESSAGE_KEY, ApplicationConstants.INVALID_CONFIG_RESPONSE_STATUS);
                        responseJSON.put(ApplicationConstants.RESPOSE_STATUS_CODE, responseMap.get(ApplicationConstants.RESPOSE_STATUS_CODE));
                    }
                }
            }
        } catch (JSONException e) {
            LOGGER.error("JSON Exception occurred while converting XML to JSON object", e);
        }
        return responseJSON;
    }
}

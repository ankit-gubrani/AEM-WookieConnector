package com.codegali.wookie.aem.core.services.impl;

import com.codegali.wookie.aem.core.client.WookieClient;
import com.codegali.wookie.aem.core.services.ServerConfigurationsService;
import com.codegali.wookie.aem.core.services.WookieService;
import com.codegali.wookie.aem.core.util.ApplicationConstants;
import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.Reference;
import org.apache.felix.scr.annotations.Service;
import org.json.JSONException;
import org.json.JSONObject;
import org.json.XML;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

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
                    configurationsService.getApiKey(), configurationsService.getSharedDataKey());

            //Query parameters do not need to start with '?'
            String queryParams = ApplicationConstants.USER_ID_QUERY_PARAM + userId + "&" +
                    ApplicationConstants.WIDGET_ID_QUERY_PARAM + widgetId + "&" + ApplicationConstants.FORMAT_QUERY_PARAM +
                    "json";

            Map<String, String> responseMap = wookieClient.makeGetRequest(API_URL, queryParams);

            if (responseMap != null) {
                LOGGER.info("Response " + responseMap.get(ApplicationConstants.RESPONSE_KEY));
                LOGGER.info("FOrmat " + responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY));

                if (!responseMap.get(ApplicationConstants.RESPONSE_KEY).equals(ApplicationConstants.INVALID_CONFIG_RESPONSE_STATUS)) {
                    if (responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY).contains(ApplicationConstants.XML_CONTENT_TYPE_RESPONSE)) {
                        responseJSON = XML.toJSONObject(responseMap.get(ApplicationConstants.RESPONSE_KEY));

                        LOGGER.info("Final JSON Object : -------" + responseJSON);
                    } else if (responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY).contains(ApplicationConstants.JSON_CONTENT_TYPE_RESPONSE)) {
                        responseJSON = new JSONObject(responseMap.get(ApplicationConstants.RESPONSE_KEY));
                    }
                } else {
                    responseJSON = new JSONObject();
                    responseJSON.put("isServerConfigValid", false);
                }
            }
        } catch (JSONException e) {
            LOGGER.error("JSON Exception occurred while converting XML to JSON object ", e);
        }
        return responseJSON;
    }

    @Override
    public void createWidgetInstance() {
        final String API_URL = "/widgetinstances";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

        //To change body of implemented methods use File | Settings | File Templates.
    }

    @Override
    public void updateInstances() {
        final String API_URL = "/widgetinstances";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());
    }

    @Override
    public JSONObject getWidgets() {
        final String API_URL = "/widgets";
        JSONObject responseJSON = null;
        try {
            WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                    configurationsService.getApiKey(), configurationsService.getSharedDataKey());

            Map<String, String> responseMap = wookieClient.makeGetRequest(API_URL, "");

            if (responseMap != null) {

                if(responseMap.get(ApplicationConstants.RESPOSE_STATUS_CODE).equals("404")) {
                    responseJSON = new JSONObject();
                    responseJSON.put(ApplicationConstants.IS_SERVER_RUNNING_RESPONSE_KEY, false);
                    responseJSON.put(ApplicationConstants.AEM_RESPONSE_MESSAGE_KEY, responseMap.get(ApplicationConstants.RESPONSE_KEY));
                    responseJSON.put(ApplicationConstants.RESPOSE_STATUS_CODE, responseMap.get(ApplicationConstants.RESPOSE_STATUS_CODE));
                } else {
                    LOGGER.info("Response " + responseMap.get(ApplicationConstants.RESPONSE_KEY));
                    LOGGER.info("Format " + responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY));

                    LOGGER.info("" + responseMap.get(ApplicationConstants.RESPONSE_FORMAT_KEY).contains(ApplicationConstants.XML_CONTENT_TYPE_RESPONSE));

                    if (!responseMap.get(ApplicationConstants.RESPONSE_KEY).equals(ApplicationConstants.INVALID_CONFIG_RESPONSE_STATUS)) {
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
            LOGGER.error("JSON Exception occurred while converting XML to JSON object ", e);
        }

        return responseJSON;
    }

    @Override
    public void addWidgets() {
        final String API_URL = "/widgets";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void updateWidgets() {
        final String API_URL = "/widgets";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void deleteWidgets() {
        final String API_URL = "/widgets";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void getParticipants() {
        final String API_URL = "/participants";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void addParticipants() {
        final String API_URL = "/participants";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void deleteParticipant() {
        final String API_URL = "/participants";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void getProperties() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void addProperty() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void updateProperty() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }

    @Override
    public void deleteProperty() {
        final String API_URL = "/properties";

        WookieClient wookieClient = new WookieClient(configurationsService.getWookieServerEndPoint(),
                configurationsService.getApiKey(), configurationsService.getSharedDataKey());

    }
}

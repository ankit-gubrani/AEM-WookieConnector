/**
 *
 * AEM-Wookie Connector tool
 * Copyright 2015 Ankit Gubrani & Rima mittal
 *
 **/
package com.codegali.wookie.aem.core.services;

import org.json.JSONObject;

public interface WookieService {

    /**
     * This method returns the representation of a widget instance.
     *  Request Method : GET  |  API_URI : widgetinstances
     * @param widgetId
     * @param userId
     */
    public JSONObject getWidgetInstance(String widgetId, String userId);

    /**
     *  This method create a new widget instance using the given parameters.
     *  Request Method : POST  |  API_URI : widgetinstances
     */
    public JSONObject createWidgetInstance(String userId, String widgetId, String sharedDataKey);

    /**
     * This method allows to either stop, resume, or clone an instance, depending on the content of the action parameter.
     * Request Method : PUT  |  API_URI : widgetinstances
     */
    public void updateInstances();

    /**
     * This method Returns an XML representation of the set of available widgets. This does not require an API key.
     * Request Method : GET  |  API_URI : widgets
     */
    public JSONObject getWidgets();

    /**
     * This method adds a widget to the server.
     * Request Method : POST  |  API_URI : widgets
     */
    public void addWidget();

    /**
     * This method updates the specified widget on the server.
     * Request Method : PUT  |  API_URI : widgets
     */
    public void updateWidgets();

    /**
     * This method deletes the specified widget on the server **and any related instances and their data**.
     * Request Method : DELETE  |  API_URI : widgets
     */
    public void deleteWidgets();

    /**
     * This method returns an XML representation of the Participants associated with the Widget instance specified
     * by instance params
     * Request Method : GET  |  API_URI : participants
     */
    public void getParticipants();

    /**
     * This method adds a participant to the specified Widget Instance
     * Request Method : POST  |  API_URI : participants
     */
    public JSONObject addParticipants(final String participantID, final String participantDisplayName, final String participantThumbnailUrl,
                                final String widgetId, final String userId, final String participantRole, final String instanceId);

    /**
     * This method deletes the specified Participant from the specified Widget Instance.
     * Request Method : DELETE  |  API_URI : participants
     */
    public void deleteParticipant();

    /**
     * This method returns the value of the specified property for the specified instance.
     * Request Method : GET  |  API_URI : properties
     */
    public void getProperties();

    /**
     * This method sets a property for the specified instance. If is_public=true is set, the property set is a Shared
     * Data entry; otherwise it is a Preference.
     * Request Method : POST  |  API_URI : properties
     */
    public void addProperty();

    /**
     * This method updates the value of the specified property of the specified Widget Instance.
     * Request Method : PUT  |  API_URI : properties
     */
    public void updateProperty();

    /**
     * This method delete the value of the specified property of the specified Widget Instance.
     * Request Method : DELETE  |  API_URI : properties
     */
    public void deleteProperty();
}

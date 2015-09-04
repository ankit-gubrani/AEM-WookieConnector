/**
 *
 * AEM-Wookie Connector tool
 * Copyright 2015 Ankit Gubrani & Rima mittal
 *
 **/
package com.codegali.wookie.aem.core.servlets;

import org.apache.felix.scr.annotations.Component;
import org.apache.felix.scr.annotations.sling.SlingServlet;
import org.apache.jackrabbit.api.security.user.Authorizable;
import org.apache.jackrabbit.api.security.user.UserManager;
import org.apache.sling.api.SlingHttpServletRequest;
import org.apache.sling.api.SlingHttpServletResponse;
import org.apache.sling.api.servlets.SlingSafeMethodsServlet;
import org.apache.sling.commons.json.JSONArray;
import org.apache.sling.commons.json.JSONException;
import org.apache.sling.commons.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.RepositoryException;
import javax.jcr.UnsupportedRepositoryOperationException;
import javax.jcr.Value;
import java.util.Iterator;

@SlingServlet(methods = {"GET"}, paths = "/bin/get/aem-users", generateComponent = false, extensions = {"JSON"},
                label = "Get AEM users servlet")
@Component(label = "Get AEM users servlet",
        description = "Servlet for fetching GivenName and Family name of all the users in AEM. Used for populating USERs dropdown",
        enabled = true, immediate = true)
public class GetAEMUsers extends SlingSafeMethodsServlet {

    private static final Logger LOGGER = LoggerFactory.getLogger(GetAEMUsers.class);

    protected void doGet(SlingHttpServletRequest request, SlingHttpServletResponse response) throws javax.servlet.ServletException, java.io.IOException {

        try {
            UserManager userManager = request.getResource().adaptTo(UserManager.class);
            Iterator<Authorizable> authorizables = userManager.findAuthorizables("jcr:primaryType", "rep:User");

            JSONArray usersArray = new JSONArray();
            JSONObject userJSONObject = null;
            if (authorizables != null) {
                while (authorizables.hasNext()) {
                    boolean isValidUser = false;
                    userJSONObject = new JSONObject();
                    Authorizable userAuthorizable = authorizables.next();

                    Value[] userFamilyName = userAuthorizable.getProperty("profile/familyName");

                    if (userFamilyName != null) {
                        for (Value familyName : userFamilyName) {
                            if (familyName != null) {
                                userJSONObject.put("value", familyName.getString());
                                isValidUser = true;
                            }
                        }
                    }

                    if (userAuthorizable.hasProperty("profile/givenName")) {
                        Value[] userGivenName = userAuthorizable.getProperty("profile/givenName");

                        if (userGivenName != null) {
                            for (Value givenName : userGivenName) {
                                if (givenName != null)
                                    userJSONObject.put("text", givenName.getString());
                            }
                        }
                    } else {
                        if (userFamilyName != null) {
                            for (Value familyName : userFamilyName) {
                                if (familyName != null)
                                    userJSONObject.put("text", familyName.getString());
                            }
                        }
                    }

                    if (isValidUser)
                        usersArray.put(userJSONObject);
                }
            }

            response.setContentType("application/json");
            response.getWriter().print(usersArray.toString());
            response.getWriter().flush();

        } catch (UnsupportedRepositoryOperationException e) {
            LOGGER.error("UnsupportedRepositoryOperationException occured while getting all USERS", e);
        } catch (RepositoryException e) {
            LOGGER.error("RepositoryException occured while getting all USERS", e);
        } catch (JSONException e) {
            LOGGER.error("JSONException occurred while getting all users");
        }
    }

}

# SSO Server Demo

### Repo contains:

1. client-fe (React)
2. login-fe (React)
3. sso-client-1 (_ExpressJS 4 that hosts to host client-fe_)
4. ssos-erver (_ExpressJS 4 Authorization server that hosts login_fe_)

When user visits localhost:5555 (_sso-client-1_), redirect to localhost:4444 (_sso-server_) to perform login.  
Once authenticated, auto redirect back to sso-client-1.  
User remains authenticated (_for 10 seconds_) in both sso-client-1 and sso-server.

### To-Do Alternatives Enhancements:

1. Use Redis cache to store ssoToken instead of passing across domains via GET & url query.

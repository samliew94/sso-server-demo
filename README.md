# SSO Server Demo

### Repo contains:

1. client-fe (Vite+React)
2. login-fe (Vite+React)
3. sso-client-1 (_ExpressJS 4 that hosts to host client-fe_)
4. sso-server (_ExpressJS 4 Authorization server that hosts login_fe_)

### Instructions to run program

Execute `npm run start` on `sso-server` and 2 instances of the server app are spawned at `localhost:5555` and `localhost:5556`.  
When you visit either `5555` or `5556`, you will be redirected to the auth server at `localhost:4444`.  
After entering username, you will redirected back to the previous origin.  
Accessing either `5555` or `5556` will have your authentication retained (_all issued tokens expire in 20s after login_).

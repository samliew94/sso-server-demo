# SSO Server Demo

### Repo contains:

1. client-fe (Vite+React)
2. login-fe (Vite+React)
3. sso-client-1 (_ExpressJS 4 that hosts to host client-fe_)
4. sso-server (_ExpressJS 4 Authorization server that hosts login_fe_)

### Instructions to execute program

1. git clone project.
2. in root folder, execute command `docker-compose up --build`
3. Navigate to clients at `localhost:3000`, `localhost:3001` or auth server at `localhost:4444`.
4. Perform login and browse to any of these 3 sites, observe the user remains authenticated.

## Conflict Manager Client
Application to help your team prevent potential conflicts before commit.

### Project background
*Back-end*: Node JS<br>
*Front-end*: TBD (actual native js)

#### Main technologies
- Client–Server App (Client Side)
- Sockets
- Web notifications
- Desktop app https://electronjs.org

#### Dependencies
- Server: https://github.com/hsplit/conflict-manager-server
- Mobile App: https://github.com/hsplit/conflict-manager-mobile-app

### Description

*Connections:*
1) client - server
2) server - server (client - remote server [further main server])
3) client - main server (sockets)

*Functional:*
1) Set project folder containing .git
2) Display the current status of your files
3) Display of potentially conflicting files (through main server [further TMS])
4) File selection and verification by its name for existing use by other users (TMS)
5) Check file for use, at the end of the path in the project, by date (TMS mongoDB)
6) Displaying a private token (for access using the mobile app)
7) Chat (TMS)

*Implemented:*
1) Working with the file system - fs module.
     1) Default configuration (project folder, api main server)
     2) Save and read the generated keys web-push
2) Working with .git - node-git module.
3) Patterns
     1) Status-checker - the task is to check the changes of git status and send them to the main server, receiving in response a list of potentially conflicting files and their users
     2) Long-poll connection - keep the connection until changes in statuses or conflicts appear
4) Chat (WebSocket TMS) - client part.
5) Server - express
6) Web Notifications - web push module. Service worker - front-end. Notifications about changes to current conflicts.
7) Middleware router and security (access restriction by localhost or private token).
8) Desktop application based on Electron JS

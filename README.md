# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Local Setup

### Install node v21
### Set up client
The client is a react application
1. `npm install` (in client directory)
2. `npm start` to start the client. Hot refreshes on file changes

### Set up server
The server is a node/express server
1. `npm install` (in server directory)
2. Create file named `.env` (in server directory) and add secrets from Lauren. Don't commit this file to github for security
3. `npx prisma generate`
4. `npm start` to start the server. Hot refreshes on file changes

### Additional tools
`.env` is used to save secrets. Shouldn't be committed but can be accessed using `env(varable)`  

`npx prisma studio` is a GUI for editing the DB and mimics the functionality of prisma in code  

`npx prisma migrate dev` migrates DB schema changes  

`prisma/`

Test Change


## Convert HTML Page to React (JSX)
Open [this page](https://transform.tools/html-to-jsx) and paste body contents from HTML page (exclude head)
### ExampleComponent.js (was ExampleComponent.html)
```jsx
function ExampleFunction() {
  return (
    <>
      {/* Converted HTML (without body tag) */}
    </>
  );
}

export default ExampleFunction
```
**(Don't do this for index.html!**

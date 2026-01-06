# CACHING PROXY SERVER

### Description
This is a CLI tool that starts a caching proxy server, it forwards requests to the actual server and cache the responses. If the same request is made again, it returns the cached response instead of forwarding the request to the server.

## Tech Stack

This project is built with:
- Commander for CLI commands
- Node.js with express.
- TypeScript for typesafety
- Dotenv — Environment variable management
- Jest — Testing framework
- Redis for caching.

## Project Structure

``` javascript
caching-proxy
    |-src
        |-utils
            |-server.ts
        |-index.ts
    |-.gitignore
    |-package.json
    |-README.md
    |-tsconfig.json
```

## Installation

Clone the project:
``` bash 
git clone <repo-url>
cd project 
```
Install dependencies by running:
``` bash
npm install 
```

## Environment Variables

Create a .env file in the project root:
``` bash
REDIS_URL=<your remote redis URL>
```

## Running the Project

To make your entry file executable, run:

``
chmod +x ./src/index.ts
``
[.](https://roadmap.sh/projects/expense-tracker-api)

Run to generate the dist file by running:

``
tsc
``

Start the proxy server by running:

``
caching-proxy -p 3000 -o https://dummyjson.com
``


## Contributing

Contributions are welcome!
prject from [.](https://roadmap.sh/projects/caching-server)
1.  Fork the repository
2. Create a new branch:
`` git checkout -b feature/my-feature`` 
3. Make your changes
4. Run tests to ensure everything passes:
``npm test``
5. Commit and push:
``git push origin feature/my-feature``
6. Create a Pull Request.

Please ensure your code follows the existing coding style and structure.


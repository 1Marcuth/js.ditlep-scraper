import express from "express";
import dotenv from "dotenv";

dotenv.config();

import routers from "./routers/index.js"

class App {
    port = process.env.port;

    constructor() {
        this.server = express();
        this.router();
        this.middleware();
    }

    router() {
        this.server.use(routers.ditlepCrawler);
    }

    middleware() {
        this.server.use(express.json());
    }

    run() {
        this.server.listen(this.port, () => {
            console.log(`O servidor foi ligado com sucesso! Ativo em: http://localhost:${this.port}/`)
        });
    }
}

export default new App();
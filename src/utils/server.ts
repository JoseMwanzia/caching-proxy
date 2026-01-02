import express, { Application, Request, Response } from "express";
import Redis from "ioredis";
import axios from "axios";
import * as dotenv from "dotenv";
dotenv.config();
const { REDIS_URL } = process.env;

class Server {
  app: Application;
  cache: Redis;

  constructor(public port: number, public origin: string) {
    this.port = port;
    this.origin = origin;
    this.cache = new Redis(REDIS_URL!);
    this.app = express();
  }

  startServer() {
    this.app.get("/", this.handleRequest.bind(this));

    this.app.listen(this.port, () => {
      console.log(`Server lisetning on port ${this.port}`);
    });
  }

  async handleRequest(req: Request, res: Response) {
    const url = `${this.origin.replace(/\/+$/, "")}/${req.originalUrl.replace(
      /^\/+/,
      ""
    )}`;
    const cachedResponse = await this.cache.get(url);

    if (cachedResponse) {
      res.setHeader("X-Cache", "HIT");
      console.info("Retrieving from cache");
      return res.status(200).send(JSON.parse(cachedResponse));
    }

    try {
      const response = await axios.get(this.origin);
      const responseData = response.data;
      console.info(`Forwarding ${this.origin} to cache`);
      this.cache.set(url, JSON.stringify(responseData), "EX", 300);

      res.setHeader("X-Cache", "MISS");
      return res.status(200).send(responseData);
    } catch (error) {
      console.error(
        `Request failed with status code: ${
          error.response ? error.response.status : 500
        }`
      );
      return res.status(500).send(error);
    }
  }

  static async clearCache(redis_url: string) {
    await new Redis(redis_url).flushall();
  }
}

export default Server;

import Server from "../src/utils/server";
import axios from "axios";
import Redis from "ioredis";
import { Request, Response } from "express";

jest.mock("axios");
jest.mock("ioredis");

const mockedAxios = axios as jest.MockedFunction<typeof axios>;
const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

jest.spyOn(console, "info").mockImplementation(() => {})

describe("Server.handleRequest", () => {
  let server: Server;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let redisInstance: any;

  beforeEach(() => {
    redisInstance = {
      get: jest.fn(),
      set: jest.fn(),
    };

    MockedRedis.mockImplementation(() => redisInstance);

    server = new Server(3000, "https://api.example.com");

    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      setHeader: jest.fn(),
    };
  });

  it("returns cached response on GET (cache HIT)", async () => {
    const cachedData = { message: "from cache" };

    req = {
      method: "GET",
      originalUrl: "/users",
      body: {},
    };

    redisInstance.get.mockResolvedValue(JSON.stringify(cachedData));

    await server.handleRequest(req as Request, res as Response);

    expect(redisInstance.get).toHaveBeenCalled();
    expect(mockedAxios).not.toHaveBeenCalled();

    expect(res.setHeader).toHaveBeenCalledWith("X-Cache", "HIT");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(cachedData);
  });

  it("fetches from origin and caches response on GET (cache MISS)", async () => {
    const apiResponse = { message: "from api" };

    req = {
      method: "GET",
      originalUrl: "/users",
      body: {},
    };

    redisInstance.get.mockResolvedValue(null);

    mockedAxios.mockResolvedValue({
      data: apiResponse,
    } as any);

    await server.handleRequest(req as Request, res as Response);

    expect(redisInstance.get).toHaveBeenCalled();
    expect(mockedAxios).toHaveBeenCalled();

    expect(redisInstance.set).toHaveBeenCalledWith(
      "https://api.example.com/users",
      JSON.stringify(apiResponse),
      "EX",
      300
    );

    expect(res.setHeader).toHaveBeenCalledWith("X-Cache", "MISS");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(apiResponse);
  });

  it("forwards non-GET requests without caching", async () => {
    const apiResponse = { created: true };

    req = {
      method: "POST",
      originalUrl: "/users",
      body: { name: "Joseph" },
    };

    mockedAxios.mockResolvedValue({
      data: apiResponse,
    } as any);

    await server.handleRequest(req as Request, res as Response);

    expect(redisInstance.get).not.toHaveBeenCalled();
    expect(redisInstance.set).not.toHaveBeenCalled();

    expect(mockedAxios).toHaveBeenCalled();
    expect(res.setHeader).toHaveBeenCalledWith("X-Cache", "MISS");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(apiResponse);
  });
});

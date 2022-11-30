import AllianceChestsCrawlerParser from "./crawler/alliance-chests/index.js";
import fs from "fs";

const allianceChestsCrawler = new AllianceChestsCrawlerParser();
const data = await allianceChestsCrawler.getData();

fs.writeFileSync("data.json", JSON.stringify(data), { encoding: "utf-8" });
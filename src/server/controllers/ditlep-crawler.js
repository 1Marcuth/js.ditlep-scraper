import AllianceChestsCrawlerParser from "../../crawler/alliance-chests/index.js";

class DitlepCrawlerController {
    async allianceChests(req, res) {
        const { month } = req.params;

        let crawler;
        
        if (month) {
            crawler = new AllianceChestsCrawlerParser(month);
        } else {
            crawler = new AllianceChestsCrawlerParser();
        }

        const data = await crawler.getData();

        res.json(data);
    }
}

export default new DitlepCrawlerController();
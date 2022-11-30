import puppeteer from "puppeteer";

class AllianceChestsCrawlerParser {
    url = "https://www.ditlep.com/alliancechest";

    constructor(month = null) {
        if (month) {
            this.url = this.url + `?month=${month}`;
        }
    }

    async getData() {
        const browser = await puppeteer.launch({ headless: true });

        const page = await browser.newPage();
        await page.goto(this.url);

        await page.setViewport({ width: 720, height: 480 });
        await page.waitForSelector(".ng-scope:nth-child(7) img.reward-info-image");
        await page.screenshot({ path: "assets/img/ditlep-alliances-chests.png", clip: { x: 9, y: 468, width: 682, height: 645 } });

        const pageContent = await page.evaluate(() => {

            class IconParser {
                constructor($icon) {
                    this.$icon = $icon;
                }

                getIconUrl() {
                    let iconUrl = this.$icon.querySelector("img").src;

                    if (iconUrl.startsWith("/")) {
                        iconUrl = "https://www.ditlep.com" +  iconUrl;
                    }

                    return iconUrl;
                }
            }
            
            class NameParser {
                constructor($name) {
                    this.$name = $name;
                }

                getName() {
                    const type = this.getType();
                    const name = `${type[0].toUpperCase()}${type.substring(1)}`;

                    return name;
                }

                getType() {
                    const type = this.$name.textContent.trim();

                    return type;
                }

                getAll() {
                    const name = this.getName();
                    const type = this.getType();

                    return { name, type };
                }
            }
            
            class TimeParser {
                constructor($time) {
                    this.$time = $time;
                    this.times = $time.textContent.trim().split("\n");
                }

                getStartTimestamp() {
                    const startTimestamp = Date.parse(this.times[0]);
                    
                    return startTimestamp;
                }

                getEndTimestamp() {
                    const endTimestamp = Date.parse(this.times[1]);

                    return endTimestamp;
                }

                getDurationInSeconds() {
                    const strDuration = this.times[2];
                    const dayInMilliseconds = 864000 * 1000;

                    if (strDuration.includes("days")) {
                        const duration = Number(strDuration.replace("days", "")) * dayInMilliseconds;

                        return duration;
                    }

                    return null;
                }
                
                getAll() {
                    const startTimestamp = this.getStartTimestamp();
                    const endTimestamp = this.getEndTimestamp();
                    const duration = this.getDurationInSeconds();

                    return {
                        start: startTimestamp,
                        end: endTimestamp,
                        duration: duration
                    };
                }
            }
            
            class RewardParser {
                dragonThumbUrlStart = "https://dci-static-s1.socialpointgames.com/static/dragoncity/mobile/ui/dragons/HD/thumb_";

                rewardTypes = {
                    breeding: "dragon_orbs",
                    arenas: "gems",
                    hatching: "food",
                    leagues: "joker_orbs"
                };

                constructor($reward, taskType) {
                    this.$reward = $reward;
                    this.taskType = taskType;
                }

                getId() {
                    const iconUrl = this.getIconUrl();
                    let id = null;

                    if (iconUrl.startsWith(this.dragonThumbUrlStart)) {
                        id = iconUrl.replace(this.dragonThumbUrlStart, "").split("_")[0];
                    }

                    if (id) {
                        id = Number(id);
                    }

                    return id;
                }

                getType() {
                    return this.rewardTypes[this.taskType];
                }

                getQuantity() {
                    const strQuantity = this.$reward.textContent.trim();
                    let quantity;

                    if (strQuantity.includes("+")) {
                        quantity = Number(strQuantity.replace("+", ""));
                    } else if (strQuantity.includes("M")) {
                        quantity = Number(strQuantity.replace("M", "000000"));
                    } else {
                        quantity = Number(strQuantity);
                    }

                    return quantity;
                }

                getIconUrl() {
                    const $icon = this.$reward.querySelector("img");

                    if (!$icon) return;
                    let iconUrl = $icon.src;
                    
                    if (iconUrl.startsWith("/")) {
                        iconUrl = "https://www.ditlep.com/" + iconUrl;
                    }

                    return iconUrl;
                } 

                getAll() {
                    const id = this.getId();
                    const type = this.getType(); 
                    const quantity = this.getQuantity();
                    const iconUrl = this.getIconUrl();

                    return { id, type, quantity, iconUrl };
                }
            }

            class ChestParser {
                constructor(
                    $icon,
                    $name,
                    $time,
                    $reward
                ) {
                    this.$icon = $icon;
                    this.$name = $name;
                    this.$time = $time;
                    this.$reward = $reward;
                }

                getIconUrl() {
                    const iconUrl = new IconParser(this.$icon).getIconUrl();

                    return iconUrl;
                }

                getNameAndType() {
                    const nameAndType = new NameParser(this.$name).getAll();

                    return nameAndType;
                }

                getTimes() {
                    const times = new TimeParser(this.$time).getAll();

                    return times;
                }

                getReward() {
                    const taskType = this.getNameAndType().type;
                    const reward = new RewardParser(this.$reward, taskType).getAll();

                    return reward;
                }

                getAll() {
                    const iconUrl = this.getIconUrl();
                    const nameAndType = this.getNameAndType();
                    const times = this.getTimes();
                    const reward = this.getReward();

                    const type = nameAndType.type;
                    const name = nameAndType.name;

                    return {
                        iconUrl: iconUrl, 
                        type: type,
                        name: name,
                        availability: times,
                        reward: reward
                    };
                }
            }

            const chestsData = [];

            const $table = document.querySelector(".col-xs-12 .tbl");

            const $iconCells = $table.querySelectorAll("td:nth-child(1)");
            const $nameCells = $table.querySelectorAll("td:nth-child(2)");
            const $timeCells = $table.querySelectorAll("td:nth-child(3)");
            const $rewardCells = $table.querySelectorAll("td:nth-child(4)");

            for (let i = 0; i <= ($iconCells.length -1); i++) {
                const chestData = new ChestParser(
                    $iconCells[i],
                    $nameCells[i],
                    $timeCells[i],
                    $rewardCells[i]
                ).getAll();
                
                chestsData.push(chestData);
            }

            return chestsData;
        });
        console.log(pageContent);

        await browser.close();
        return pageContent;
    }
}

export default AllianceChestsCrawlerParser;
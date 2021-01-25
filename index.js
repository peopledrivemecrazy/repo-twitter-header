import { send } from "httpie";
import dotenv from "dotenv";
dotenv.config();
import Twitter from "twitter-lite";

import { createRequire } from "module";

const require = createRequire(import.meta.url);

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const URL = process.env.URL;
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

const timer = 60000

const client = new Twitter({
  subdomain: "api",
  version: "1.1",
  consumer_key: API_KEY,
  consumer_secret: API_SECRET,
  access_token_key: ACCESS_TOKEN,
  access_token_secret: ACCESS_TOKEN_SECRET,
});

const applyText = (canvas, text) => {
  const ctx = canvas.getContext("2d");

  let fontSize = 70;

  do {
    ctx.font = `${(fontSize -= 10)}px sans-serif`;
  } while (ctx.measureText(text).width > canvas.width - 300);

  return ctx.font;
};

(async function getStars() {
  let starsCount = "";
  let stars = await send("GET", URL, {
    headers: {
      "User-Agent": "request",
    },
  });
  starsCount = stars.data.stargazers_count;
  console.log(`Stars: ${stars.data.stargazers_count}`);

  const canvas = createCanvas(1500, 497);
  const ctx = canvas.getContext("2d");

  ctx.font = "10px Impact";

  await loadImage("./media.png").then((image) => {
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
  });
  ctx.font = applyText(canvas, `Svelte stars: ${starsCount}`);
  ctx.fillStyle = "#000000";
  ctx.fillText(
    `Svelte stars: ${starsCount}`,
    canvas.width / 2,
    canvas.height / 1.8
  );

  client
    .post("account/update_profile_banner", {
      banner: Buffer.from(canvas.toBuffer()).toString("base64"),
    })
    .catch(console.error);

  fs.writeFileSync(
    "out.jpg",
    canvas.toBuffer(undefined, 3, canvas.PNG_FILTER_NONE)
  );
  setTimeout(getStars, timer);
})();

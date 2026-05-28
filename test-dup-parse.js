const { parseFile } = require("./backend/utils/fileParser");

parseFile("./dup-sample.csv", "dup-sample.csv")
  .then((res) => {
    console.log("HEADERS:", JSON.stringify(res.headers, null, 2));
    console.log("ROWS_SAMPLE:", JSON.stringify(res.rows, null, 2));
  })
  .catch((err) => {
    console.error("ERROR:", err);
    process.exit(1);
  });

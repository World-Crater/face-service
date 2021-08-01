const faceppModel = require("../../model/facepp");
const faceppValidator = require("../../model/facepp-validator");

test("should get face faceset detail", async () => {
  const facepp = new faceppModel("", "", "4cf0e4c388c91f4ef3590dd9b45c53f8");
  const [result, err] = await facepp.getDetail();
  console.log(faceppValidator.isFull(JSON.parse(result.body)));
});

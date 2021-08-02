const { Success } = require("monet");
const faceppModel = require("../../model/facepp");
const faceppValidator = require("../../model/facepp-validator");

test("should get face faceset detail", async () => {
  const facepp = new faceppModel("", "", "4cf0e4c388c91f4ef3590dd9b45c53f8");
  const eitherResult = (await facepp.getDetail())
    .map((result) => JSON.parse(result.body))
    .map((body) => faceppValidator.isFull(body));
  console.log(eitherResult.isLeft());
  console.log(eitherResult.toMaybe().getOrElse({}));
});

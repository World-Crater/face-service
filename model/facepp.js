const request = require("request-promise");
const fs = require("fs");
const { Right, Left } = require("monet");

class facepp {
  constructor(faceppKey, faceppSecret, faceppFaceset) {
    this.faceppKey = faceppKey;
    this.faceppSecret = faceppSecret;
    this.faceppFaceset = faceppFaceset;
  }

  async detect(imagePath) {
    try {
      const image = fs.createReadStream(imagePath);
      const result = await request({
        resolveWithFullResponse: true,
        method: "POST",
        url: "https://api-cn.faceplusplus.com/facepp/v3/detect",
        headers: {
          "Content-type": "multipart/form-data",
        },
        qs: {
          api_key: this.faceppKey,
          api_secret: this.faceppSecret,
        },
        formData: {
          image_file: image,
        },
      });
      return [result, null];
    } catch (err) {
      return [null, err];
    }
  }

  search(imagePath, resultCount = 1) {
    const image = fs.createReadStream(imagePath);
    return request({
      resolveWithFullResponse: true,
      method: "POST",
      url: "https://api-cn.faceplusplus.com/facepp/v3/search",
      headers: {
        "Content-type": "multipart/form-data",
      },
      qs: {
        api_key: this.faceppKey,
        api_secret: this.faceppSecret,
        faceset_token: this.faceppFaceset,
        return_result_count: resultCount,
      },
      formData: {
        image_file: image,
      },
    });
  }

  async addFace(faceTokens) {
    try {
      const result = await request({
        resolveWithFullResponse: true,
        method: "POST",
        url: "https://api-cn.faceplusplus.com/facepp/v3/faceset/addface",
        headers: {
          "Content-type": "application/json",
        },
        qs: {
          api_key: this.faceppKey,
          api_secret: this.faceppSecret,
          faceset_token: this.faceppFaceset,
          face_tokens:
            faceTokens.length > 1 ? faceTokens.join(",") : faceTokens[0],
        },
      });
      return [result, null];
    } catch (err) {
      return [null, err];
    }
  }

  async getDetail() {
    try {
      const result = await request({
        resolveWithFullResponse: true,
        method: "POST",
        url: "https://api-cn.faceplusplus.com/facepp/v3/faceset/getdetail",
        headers: {
          "Content-type": "application/json",
        },
        qs: {
          api_key: this.faceppKey,
          api_secret: this.faceppSecret,
          faceset_token: this.faceppFaceset,
        },
      });
      return Right(result);
    } catch (err) {
      return Left(err);
    }
  }
}

module.exports = facepp;

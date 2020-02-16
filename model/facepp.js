const request = require("request-promise");
const fs = require("fs");

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
          "Content-type": "multipart/form-data"
        },
        qs: {
          api_key: this.faceppKey,
          api_secret: this.faceppSecret
        },
        formData: {
          image_file: image
        }
      });
      return [result, null];
    } catch (err) {
      return [null, err];
    }
  }

  async search(imagePath) {
    try {
      const image = fs.createReadStream(imagePath)
      const result = await request({
        resolveWithFullResponse: true,
        method: "POST",
        url: "https://api-cn.faceplusplus.com/facepp/v3/search",
        headers: {
          "Content-type": "multipart/form-data"
        },
        qs: {
          api_key: this.faceppKey,
          api_secret: this.faceppSecret,
          faceset_token: this.faceppFaceset
        },
        formData: {
          image_file: image
        }
      })
      return [result, null]
    } catch (err) {
      return [null, err]
    }
  }

  async addFace(faceTokens) {
    try {
      const result = await request({
        resolveWithFullResponse: true,
        method: "POST",
        url: "https://api-cn.faceplusplus.com/facepp/v3/faceset/addface",
        headers: {
          "Content-type": "application/json"
        },
        qs: {
          api_key: this.faceppKey,
          api_secret: this.faceppSecret,
          faceset_token: this.faceppFaceset,
          face_tokens: faceTokens.length > 1 ? faceTokens.join(",") : faceTokens[0]
        }
      })
      return [result, null]
    } catch (err) {
      return [null, err]
    }
  }
}

module.exports = facepp

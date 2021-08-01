const faceppValidator = {
  isFull(faceppDetailBody) {
    return faceppDetailBody.face_count >= 10000;
  },
};

module.exports = faceppValidator;

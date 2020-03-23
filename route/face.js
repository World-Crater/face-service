const router = require('express').Router();
const multer  = require('multer')

const faceController = require('../controller/face')

const upload = multer({ dest: 'other/temp/image' })

router.get('/',
    faceController.searchFacesBySimilarName
)

router.get('/:faceID',
    faceController.getFacesByID
)

router.post('/',
    upload.single('image'),
    faceController.createFacesByImage
)

router.post('/search',
    upload.single('image'),
    faceController.searchFacesByImage
)

module.exports = router;
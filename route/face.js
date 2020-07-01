const router = require('express').Router();
const multer  = require('multer')

const faceController = require('../controller/face')

const upload = multer({ dest: 'other/temp/image' })

router.get('/',
    faceController.searchFacesBySimilarName
)

router.get('/info',
    faceController.getAllInfos
)

router.post('/info',
    upload.single('preview'),
    faceController.createInfo
)

router.put('/info/:id',
    upload.single('preview'),
    faceController.updateInfo
)

router.get('/random',
    faceController.getRandomFaces
)

router.get('/:faceID',
    faceController.getFacesByID
)

router.post('/face',
    upload.single('image'),
    faceController.createFacesByImage
)

router.post('/search',
    upload.single('image'),
    faceController.searchFacesByImage
)

module.exports = router;
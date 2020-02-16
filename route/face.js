const router = require('express').Router();
const multer  = require('multer')

const faceController = require('../controller/face')

const upload = multer({ dest: 'other/temp/image' })

router.get('/:faceID',
    faceController.getFacesByID
)
router.post('/',
    upload.single('image'),
    faceController.createFacesByImage
)
// router.delete('/:id',
//     faceFaceController.destroy
// )

module.exports = router;
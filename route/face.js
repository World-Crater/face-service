const router = require('express').Router()
const multer = require('multer')
const ow = require('ow')

const middlewareValidation = require('../middleware/validation')
const middlewareFile = require('../middleware/file')

const faceController = require('../controller/face')

const upload = multer({ dest: 'other/temp/image' })

router.get('/', faceController.searchFacesBySimilarName)

router.get(
  '/infos',
  middlewareValidation.checkArguments({
    query: {
      limit: ow.optional.string,
      offset: ow.optional.string,
      likeName: ow.optional.string,
    },
  }),
  faceController.getAllInfos
)

router.get('/info', faceController.getAllInfos)

router.post('/info', upload.single('preview'), faceController.createInfo, middlewareFile.deleteUploadedFile)

router.put('/info/:id', upload.single('preview'), faceController.updateInfo, middlewareFile.deleteUploadedFile)

router.delete('/info/:id', faceController.deleteInfo)

router.get('/random', faceController.getRandomFaces)

router.get('/face/:faceID', faceController.getFacesByID)

router.post('/face', upload.single('image'), faceController.createFacesByImage, middlewareFile.deleteUploadedFile)

router.post('/search', upload.single('image'), faceController.searchFacesByImage, middlewareFile.deleteUploadedFile)

router.post('/detect', upload.single('image'), faceController.faceDetect, middlewareFile.deleteUploadedFile)

module.exports = router

const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

router.post("/upload", (req, res)=>{
    upload.single("image")(req, res, (err) =>{
        if(err){
            return res.status(400).json({
                success : false,
                message : err.message
            })
        }

            if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image to upload",
      });
    }

        return res.status(201).json({
            success : true,
            message: "Image uploaded successfully",
            image : {
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                path: req.file.path,
            }
        })
    })
});


module.exports = router;


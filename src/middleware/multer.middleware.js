import multer from "multer";
import path from "path";

const filetypes = /xlsx|xls|csv/;

const uploadExcelSheet = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: function (req, file, cb) {
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype =
      file.mimetype ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || // .xlsx
      file.mimetype === "application/vnd.ms-excel" || // .xls
      file.mimetype === "text/csv"; // .csv
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xlsx, .xls, .csv) are allowed!"));
    }
  },
});
const imgTypes = /jpg|jpeg|png/
const uploadImg = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024  }, // 10MB
  fileFilter: function (req, file, cb) {
    const extname = imgTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error("Ooops! Image type can only be jpeg, jpg, png"));
    }
  },
});

export{ uploadExcelSheet,uploadImg};

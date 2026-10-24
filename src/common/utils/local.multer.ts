import multer from "multer";
import fs from "node:fs";
import { Request } from "express";

interface IMulterLocalOptions {
  customPath?: string;
  customType?: string[];
}

export const multerLocal = (
  {
    customPath = "general",
    customType = [],
  }: IMulterLocalOptions = {}
) => {

  const dirPath = `uploads/${customPath}`;

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const storage = multer.diskStorage({

    destination: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, destination: string) => void
    ) => {
      cb(null, dirPath);
    },

    filename: (
      req: Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {

      const uniqueSuffix =
        Date.now() + "-" + Math.round(Math.random() * 1E9);

      cb(
        null,
        uniqueSuffix + "__" + file.originalname
      );
    },
  });

  const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
  ) => {

    // if (!customType.includes(file.mimetype)) {
    //   return cb(new Error("Invalid file type"));
    // }

    cb(null, true);
  };

  const upload = multer({
    storage,
    fileFilter,
  });

  return upload;
};
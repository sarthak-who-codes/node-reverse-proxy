import fs from "node:fs";

type TReturn =
  | {
      exist: true;
      fileData: any;
    }
  | {
      exist: false;
      error: Error;
    };

export function isFileExist(filePath: string): Promise<TReturn> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) resolve({ exist: false, error: err });

      resolve({ exist: true, fileData: data });
    });
  });
}

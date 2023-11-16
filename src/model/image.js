import aws from "aws-sdk";
import uuidv4 from "uuid/v4";
import path from "path";

export default {
  save: async function(image) {
    const s3 = new aws.S3();
    const name = uuidv4() + path.extname(image.name);
    const params = {
      Bucket: process.env.AWS_S3_BUCKET,
      Key: name,
      ACL: "public-read",
      Body: image.data,
      ContentType: image.mimetype
    };

    return new Promise(function(resolve, reject) {
      s3.upload(params, (err, data) => {
        if (err) {
          reject(new Error(err.message));
          return;
        }
        resolve({ link: data.Location });
      });
    });
  }
};

import * as AWS from 'aws-sdk';

export function getSignedCookie(resource, expiration) {
  const cloudFront = new AWS.CloudFront.Signer(process.env.CLOUDFRONT_KEY_PAIR_ID, process.env.CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, '\n'));
    const policy = JSON.stringify({
        Statement: [
            {
                Resource: resource,
                Condition: {
                    DateLessThan: { "AWS:EpochTime": expiration }
                }
            }
        ]
    });

    const options = {
        policy: policy
    };

    return cloudFront.getSignedCookie(options);
}

export async function getPresignedImageUploadUrl(key: string): Promise<string> {
  const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: 'v4',
    region: process.env.AWS_REGION,
  });

  try {
    const presignedUrl = s3.getSignedUrl('putObject', {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `images/${key}`,
      Expires: 60,
    });

    return presignedUrl;
  } catch (error) {
    console.error('Detailed error generating presigned upload URL:', error);
    throw new Error(`Error generating presigned upload URL: ${error.message}`);
  }
}

export async function getPresignedAvatarUrl(key: string): Promise<string> {
  const privateKeyString = process.env.CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, '\n');
  const cloudfront = new AWS.CloudFront.Signer(process.env.CLOUDFRONT_KEY_PAIR_ID, privateKeyString);
  try {
    const url = `https://${process.env.CLOUDFRONT_DOMAIN_NAME}/avatars/${key}`;

    const signedUrl = cloudfront.getSignedUrl({
      url: url,
      expires: Math.floor((Date.now() + 604800000) / 1000),
    });

    return signedUrl;
  } catch (error) {
    console.error('Detailed error generating signed CloudFront URL:', error);
    throw new Error(`Error generating signed CloudFront URL: ${error.message}`);
  }
}

  export async function getPresignedThumbUrl(key: string): Promise<string> {
    const privateKeyString = process.env.CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, '\n');
    const cloudfront = new AWS.CloudFront.Signer(process.env.CLOUDFRONT_KEY_PAIR_ID, privateKeyString);
    try {
      const url = `https://${process.env.CLOUDFRONT_DOMAIN_NAME}/thumbnails/images/${key}`;
  
      const signedUrl = cloudfront.getSignedUrl({
        url: url,
        expires: Math.floor((Date.now() + 604800000) / 1000), 
      });
  
      return signedUrl;
    } catch (error) {
      console.error('Detailed error generating signed CloudFront URL:', error);
      throw new Error(`Error generating signed CloudFront URL: ${error.message}`);
    }
  }

  export async function getPresignedFullUrl(key: string): Promise<string> {
    const privateKeyString = process.env.CLOUDFRONT_PRIVATE_KEY.replace(/\\n/g, '\n');
    const cloudfront = new AWS.CloudFront.Signer(process.env.CLOUDFRONT_KEY_PAIR_ID, privateKeyString);
    try {
      const url = `https://${process.env.CLOUDFRONT_DOMAIN_NAME}/images/${key}`;
  
      const signedUrl = cloudfront.getSignedUrl({
        url: url,
        expires: Math.floor((Date.now() + 604800000) / 1000), 
      });
  
      return signedUrl;
    } catch (error) {
      console.error('Detailed error generating signed CloudFront URL:', error);
      throw new Error(`Error generating signed CloudFront URL: ${error.message}`);
    }
  }
  
  export function parseCookie(cookieString: string, cookieName: string): string | null {
    const name = cookieName + "=";
    const decodedCookie = decodeURIComponent(cookieString);
    const ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
  }
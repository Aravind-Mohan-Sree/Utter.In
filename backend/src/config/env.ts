import { SSMClient, GetParametersByPathCommand, Parameter } from '@aws-sdk/client-ssm';

const fetchSSMParameters = async (path: string): Promise<Record<string, string>> => {
  const ssmClient = new SSMClient({ region: process.env.AWS_REGION || 'us-east-1' });
  const parameters: Record<string, string> = {};
  try {
    let nextToken: string | undefined;
    do {
      const command: GetParametersByPathCommand = new GetParametersByPathCommand({
        Path: path,
        WithDecryption: true,
        Recursive: true,
        NextToken: nextToken,
      });

      const response = await ssmClient.send(command);
      response.Parameters?.forEach((p: Parameter) => {
        if (p.Name && p.Value) {
          const key = p.Name.replace(path, '');
          parameters[key] = p.Value;
        }
      });
      nextToken = response.NextToken;
    } while (nextToken);
  } catch (error) {
    console.error('Error fetching SSM parameters:', error);
  }
  return parameters;
};

export const initializeAWSConfig = async () => {
  let ssmPrefix = process.env.SSM_PREFIX || '/utter/prod/';
  if (!ssmPrefix.endsWith('/')) ssmPrefix += '/';
  
  const ssmParams = (process.env.NODE_ENV === 'production' || process.env.USE_SSM === 'true')
    ? await fetchSSMParameters(ssmPrefix)
    : {};

  Object.assign(process.env, ssmParams);
};

export const env = {
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
  get PORT() { return process.env.PORT || 5000; },
  get MONGO_CONNECTION_URI() {
    return process.env.MONGO_CONNECTION_URI || 'mongodb://localhost:27017/utter_web_app';
  },
  get NODEMAILER_USER() { return process.env.NODEMAILER_USER || ''; },
  get NODEMAILER_PASS() { return process.env.NODEMAILER_PASS || ''; },
  get NODEMAILER_HOST() { return process.env.NODEMAILER_HOST || ''; },
  get NODEMAILER_PORT() { return process.env.NODEMAILER_PORT || ''; },
  get JWT_ALGORITHM() { return process.env.JWT_ALGORITHM || ''; },
  get ACCESS_TOKEN_SECRET() { return process.env.ACCESS_TOKEN_SECRET || ''; },
  get REFRESH_TOKEN_SECRET() { return process.env.REFRESH_TOKEN_SECRET || ''; },
  get RESET_TOKEN_SECRET() { return process.env.RESET_TOKEN_SECRET || ''; },
  get ACCESS_TOKEN_AGE() { return process.env.ACCESS_TOKEN_AGE || ''; },
  get REFRESH_TOKEN_AGE() { return process.env.REFRESH_TOKEN_AGE || ''; },
  get RESET_TOKEN_AGE() { return process.env.RESET_TOKEN_AGE || ''; },
  get OTP_AGE() { return process.env.OTP_AGE || ''; },
  get GOOGLE_CLIENT_ID() { return process.env.GOOGLE_CLIENT_ID || ''; },
  get GOOGLE_CLIENT_SECRET() { return process.env.GOOGLE_CLIENT_SECRET || ''; },
  get GOOGLE_USER_CALLBACK_URL() { return process.env.GOOGLE_USER_CALLBACK_URL || ''; },
  get GOOGLE_TUTOR_CALLBACK_URL() { return process.env.GOOGLE_TUTOR_CALLBACK_URL || ''; },
  get SESSION_SECRET() { return process.env.SESSION_SECRET || ''; },
  get COOKIE_DOMAIN() { return process.env.COOKIE_DOMAIN || ''; },
  get FRONTEND_URL() { return process.env.FRONTEND_URL || ''; },
  get AWS_REGION() { return process.env.AWS_REGION || ''; },
  get AWS_BUCKET() { return process.env.AWS_BUCKET || ''; },
  get AWS_ACCESS_KEY_ID() { return process.env.AWS_ACCESS_KEY_ID || ''; },
  get AWS_SECRET_ACCESS_KEY() { return process.env.AWS_SECRET_ACCESS_KEY || ''; },
  get RAZORPAY_KEY_ID() { return process.env.RAZORPAY_KEY_ID || ''; },
  get RAZORPAY_KEY_SECRET() { return process.env.RAZORPAY_KEY_SECRET || ''; },
  get REDIS_URL() { return process.env.REDIS_URL || 'redis://127.0.0.1:6379'; },
  get CALL_JOIN_THRESHOLD_MINUTES() { return process.env.CALL_JOIN_THRESHOLD_MINUTES || '5'; },
  get SESSION_COMPLETION_THRESHOLD_MINUTES() { return process.env.SESSION_COMPLETION_THRESHOLD_MINUTES || '50'; },
  get GEMINI_API_KEY() { return process.env.GEMINI_API_KEY || ''; },
};

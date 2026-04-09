import { SSMClient, GetParametersByPathCommand, Parameter } from '@aws-sdk/client-ssm';

const fetchSSMParameters = async (path: string): Promise<Record<string, string>> => {
  const ssmClient = new SSMClient({ region: 'ap-south-1' });
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
  const ssmPrefix = process.env.SSM_PREFIX || '/utter/prod/';
  
  console.log(`Attempting to fetch from: ${ssmPrefix}`);
  
  const ssmParams = await fetchSSMParameters(ssmPrefix);

  if (Object.keys(ssmParams).length === 0) {
    console.warn("WARNING: No parameters were fetched from SSM!");
  } else {
    console.log(`Successfully fetched ${Object.keys(ssmParams).length} parameters.`);
    console.log("Keys found:", Object.keys(ssmParams)); 
  }

  Object.assign(process.env, ssmParams);
};

export const env = {
  get NODE_ENV() { return process.env.NODE_ENV || 'development'; },
  get PORT() { return process.env.PORT || 5000; },
  get MONGO_CONNECTION_URI() {
    return process.env.MONGO_CONNECTION_URI || 'mongodb://localhost:27017/utter_web_app';
  },
  get NODEMAILER_USER() { return process.env.NODEMAILER_USER || 'dummy_user'; },
  get NODEMAILER_PASS() { return process.env.NODEMAILER_PASS || 'dummy_pass'; },
  get NODEMAILER_HOST() { return process.env.NODEMAILER_HOST || 'smtp.dummy.com'; },
  get NODEMAILER_PORT() { return process.env.NODEMAILER_PORT || '587'; },
  get JWT_ALGORITHM() { return process.env.JWT_ALGORITHM || 'HS256'; },
  get ACCESS_TOKEN_SECRET() { return process.env.ACCESS_TOKEN_SECRET || 'dummy_access_secret'; },
  get REFRESH_TOKEN_SECRET() { return process.env.REFRESH_TOKEN_SECRET || 'dummy_refresh_secret'; },
  get RESET_TOKEN_SECRET() { return process.env.RESET_TOKEN_SECRET || 'dummy_reset_secret'; },
  get ACCESS_TOKEN_AGE() { return process.env.ACCESS_TOKEN_AGE || '1h'; },
  get REFRESH_TOKEN_AGE() { return process.env.REFRESH_TOKEN_AGE || '7d'; },
  get RESET_TOKEN_AGE() { return process.env.RESET_TOKEN_AGE || '15m'; },
  get OTP_AGE() { return process.env.OTP_AGE || '5m'; },
  get GOOGLE_CLIENT_ID() { return process.env.GOOGLE_CLIENT_ID || 'dummy_google_client_id'; },
  get GOOGLE_CLIENT_SECRET() { return process.env.GOOGLE_CLIENT_SECRET || 'dummy_google_client_secret'; },
  get GOOGLE_USER_CALLBACK_URL() { return process.env.GOOGLE_USER_CALLBACK_URL || 'http://localhost:5000/api/user/auth/google/callback'; },
  get GOOGLE_TUTOR_CALLBACK_URL() { return process.env.GOOGLE_TUTOR_CALLBACK_URL || 'http://localhost:5000/api/tutor/auth/google/callback'; },
  get SESSION_SECRET() { return process.env.SESSION_SECRET || 'dummy_session_secret'; },
  get COOKIE_DOMAIN() { return process.env.COOKIE_DOMAIN || 'localhost'; },
  get FRONTEND_URL() { return process.env.FRONTEND_URL || 'http://localhost:5173'; },
  get AWS_REGION() { return process.env.AWS_REGION || 'us-east-1'; },
  get AWS_BUCKET() { return process.env.AWS_BUCKET || 'dummy_bucket'; },
  get AWS_ACCESS_KEY_ID() { return process.env.AWS_ACCESS_KEY_ID || 'dummy_access_key'; },
  get AWS_SECRET_ACCESS_KEY() { return process.env.AWS_SECRET_ACCESS_KEY || 'dummy_secret_key'; },
  get RAZORPAY_KEY_ID() { return process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy'; },
  get RAZORPAY_KEY_SECRET() { return process.env.RAZORPAY_KEY_SECRET || 'dummy_razorpay_secret'; },
  get REDIS_URL() { return process.env.REDIS_URL || 'redis://127.0.0.1:6379'; },
  get CALL_JOIN_THRESHOLD_MINUTES() { return process.env.CALL_JOIN_THRESHOLD_MINUTES || '5'; },
  get SESSION_COMPLETION_THRESHOLD_MINUTES() { return process.env.SESSION_COMPLETION_THRESHOLD_MINUTES || '50'; },
  get GEMINI_API_KEY() { return process.env.GEMINI_API_KEY || 'dummy_gemini_key'; },
};

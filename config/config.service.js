import dotenv from "dotenv";

const NODE_ENV = process.env.NODE_ENV ?? "development";
const envFile = `.env.${NODE_ENV}`;

// Locally the variables come from the .env files.
// On AWS there are no .env files (they are not in GitHub): the variables come
// from the server's environment. dotenv skips a missing file without throwing,
// and it never overrides variables that are already set in the environment.
dotenv.config({ path: [envFile, ".env"] });

const required = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const envConfig = {
  nodeEnv: NODE_ENV,
  port: Number(process.env.PORT) || 3000,
  database: {
    // In production the app must never fall back to a local database
    uri:
      NODE_ENV === "production"
        ? required("DB_URI_LOCAL")
        : process.env.DB_URI_LOCAL ?? "mongodb://localhost/test_db",
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    iv: parseInt(process.env.IV_LENGTH) || 16,
  },
  jwt:
  {
    user: {
      access_token_secret: process.env.USER_ACCESS_TOKEN_SECRET,
      access_token_expires_in: process.env.USER_ACCESS_TOKEN_EXPIRES_IN,
      refresh_token_secret: process.env.USER_REFRESH_ACCESS_TOKEN_SECRET,
      refresh_token_expires_in: process.env.USER_REFRESH_ACCESS_TOKEN_EXPIRES_IN

    },
    admin: {
      access_token_secret: process.env.ADMIN_ACCESS_TOKEN_SECRET,
      access_token_expires_in: process.env.ADMIN_ACCESS_TOKEN_EXPIRES_IN,
      refresh_token_secret: process.env.ADMIN_REFRESH_ACCESS_TOKEN_SECRET,
      refresh_token_expires_in: process.env.ADMIN_REFRESH_ACCESS_TOKEN_EXPIRES_IN

    }
  },
  GCP:{
    client_id:process.env.GCP
  },
  redis:{
    url:process.env.REDIS_CLOUD_URL
  },
  email:{
    user:process.env.EMAIL_USER,
    pass:process.env.EMAIL_PASS
  }
};

export default envConfig;
const axios = require('axios');

const PHONEPE_CLIENT_ID = process.env.PHONEPE_CLIENT_ID || 'PGTESTPAYUAT86';
const PHONEPE_CLIENT_SECRET = process.env.PHONEPE_CLIENT_SECRET || '099eb0cd-02cf-4e2a-8aca-3e6c6aff0399';
const PHONEPE_CLIENT_VERSION = process.env.PHONEPE_CLIENT_VERSION || '1';

// Token endpoints
const isProd = (process.env.PHONEPE_ENV === 'production' || process.env.NODE_ENV === 'production');

const PHONEPE_OAUTH_URL = isProd
  ? 'https://api.phonepe.com/apis/identity-manager/v1/oauth/token' 
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox/v1/oauth/token';

// Checkout endpoints
const PHONEPE_CHECKOUT_URL = isProd
  ? 'https://api.phonepe.com/apis/pg/checkout/v2/pay'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/pay';

// Status endpoints
const PHONEPE_STATUS_URL = isProd
  ? 'https://api.phonepe.com/apis/pg/checkout/v2/order'
  : 'https://api-preprod.phonepe.com/apis/pg-sandbox/checkout/v2/order';

/**
 * Generate OAuth token for PhonePe V2 APIs
 */
const generateOAuthToken = async () => {
  try {
    const data = new URLSearchParams();
    data.append('client_id', PHONEPE_CLIENT_ID);
    data.append('client_secret', PHONEPE_CLIENT_SECRET);
    data.append('client_version', PHONEPE_CLIENT_VERSION);
    data.append('grant_type', 'client_credentials');

    const response = await axios.post(PHONEPE_OAUTH_URL, data.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    if (response.data && response.data.access_token) {
      return response.data.access_token;
    }
    throw new Error('No access token in response');
  } catch (error) {
    console.error('PhonePe OAuth Error:', error.response?.data || error.message);
    throw new Error('Failed to generate PhonePe OAuth token');
  }
};

const validateWebhookSignature = (authHeader) => {
  if (!authHeader) return false;
  const crypto = require('crypto');
  const expectedHash = crypto
    .createHash('sha256')
    .update(`${PHONEPE_CLIENT_ID}:${PHONEPE_CLIENT_SECRET}`)
    .digest('hex');
  return authHeader === expectedHash || authHeader === `Bearer ${expectedHash}`; // some sdks add bearer
};

module.exports = {
  PHONEPE_CLIENT_ID,
  PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT86',
  PHONEPE_CHECKOUT_URL,
  PHONEPE_STATUS_URL,
  generateOAuthToken,
  validateWebhookSignature
};
